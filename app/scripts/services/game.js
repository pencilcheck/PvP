'user strict';

angular.module('PvP')
  .factory('Game', function ($rootScope, $routeParams, $q, Games, Moves, Channel, $firebase, firebaseUrl, convertFirebase) {
    var meta = Games.get(),
        log = [];

    return function (gameId, userId) {
      return Games.get(gameId).$then(function (game) {
        var o = {
          onChange: function (attr, cb) {
            game.$child(attr).$on('change', function () {
              cb(game[attr]);
            });
          },
          game: game,
          players: game.players,
          currentPlayer: function () {
            return game.players[userId];
          },
          state: game.state,
          rounds: game.$child('rounds'),
          commitMove: function (move) {
            //$scope.game.$save('players').then(function () {
            convertFirebase(game.$child('players').$child(userId)).$then(function (player) {
              var moves = player.selectedMoves || {};
              moves[move.name] = move;
              player.selectedMoves = moves;
              player.$save();
              return player;
            });
          },
          doneCommitMoves: function () {
            // FIXME: update game.state from firebase before checking
            if (game.state.name == 'waiting_pick') {
              if (game.state.detail == 'both') {
                game.state = {
                  name: 'waiting_pick',
                  detail: userId
                };
              } else if (game.state.detail != userId) {
                game.state = {
                  name: 'waiting_move',
                  detail: 'both'
                };
              }
            }
            game.$save('state');
          },
          commitAttack: function (move) {
            convertFirebase(game.$child('rounds')).$then(function (rounds) {
              var lastIndex = rounds.$getIndex()[rounds.$getIndex().length-1];
              var lastRound = rounds[lastIndex];
              if (lastRound && lastRound.move && Object.keys(lastRound.move).length < Object.keys(game.players).length) {
                lastRound.move[userId] = move;
                rounds.$save(lastIndex);

                if (Object.keys(lastRound.move).length == Object.keys(game.players).length) {
                  // Fight
                  var opponentId = null;
                  Object.keys(game.players).forEach(function (id) {
                    if (userId != id) {
                      opponentId = id;
                    }
                  });
                  var result = Moves.damageMatrix(lastRound.move[userId].name, lastRound.move[opponentId].name);
                  game.players[userId].health -= result[0];
                  game.players[opponentId].health -= result[1];

                  Object.keys(game.players).forEach(function (userId) {
                    game.players[userId].notSeenAnimation = lastIndex;
                  });
                  game.$save('players');

                  var text = Moves.textualizeAttack(game.players[userId].name, game.players[opponentId].name, lastRound.move[userId].name, lastRound.move[opponentId].name, result[0], result[1]);
                  console.log(game.players[userId].name, game.players[opponentId].name, lastRound.move[userId].name, lastRound.move[opponentId].name, result[0], result[1]);
                  lastRound.log = text;
                  rounds.$save(lastIndex);

                  if (game.players[userId].health <= 0 || game.players[opponentId].health <= 0) {
                    game.state = {
                      name: "game_ended"
                    };

                    var winnerId;
                    if (game.players[userId].health > 0) {
                      winnerId = opponentId;
                    } else if (game.players[opponentId].health > 0) {
                      winnerId = userId;
                    } else {
                      // Both players have negative health
                      if (Math.abs(result[0]) > Math.abs(result[1])) {
                        winnerId = opponentId;
                      } else if (Math.abs(result[0]) < Math.abs(result[1])) {
                        winnerId = userId;
                      }
                    }

                    game.state.detail = game.players[winnerId]
                  } else {
                    game.state = {
                      name: "waiting_move"
                    };
                  }
                  game.$save('state');
                }
              } else {
                var data = {
                  move: {
                  },
                  log: ""
                };
                data.move[userId] = move;
                rounds.$add(data)

                game.state = {
                  name: "waiting_other_move",
                  detail: userId
                };
                game.$save('state');
              }
            });
          }
        };


        o.watch('game', function (id, oldVal, newVal) {
          // Update to server
          Games.g.$save(gameId);
        });

        o.watch('players', function (id, oldVal, newVal) {
          // Update to server
          Games.g.$save(gameId);
        });

        return o;
      });
    };
  });
