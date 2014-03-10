'user strict';

angular.module('PvP')
  .factory('Game', function ($rootScope, $routeParams, $q, Games, Moves, Channel, $firebase, firebaseUrl, convertFirebase) {
    var meta = Games.get(),
        log = [];

    var determineStatus = function (state, userId) {
      switch (state.name) {
      case 'waiting_join':
        return 'Waiting for opponent to join...';
        break;
      case 'waiting_pick':
        if (state.detail == userId)
          return 'Waiting on other to pick moves...';
        else if (state.detail == 'both')
          return 'Pick your moves...';
        else
          return 'Waiting on you to pick moves...';
        break;
      case 'waiting_move':
        if (state.detail == userId)
          return 'Waiting on other to pick an attack...';
        else
          return 'Waiting on you to pick an attack...';
        break;
      case 'not_seen_animation':
        if (state.detail == userId) {
        } else {
        }
        break;
      case 'game_ended':
        return 'Game ended';
        break;
      default:
        return 'Cowabunga!';
        break;
      }
    };

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
          status: function () {
            return determineStatus(game.state, userId);
          },
          state: game.state,
          rounds: game.$child('rounds'),
          commitAttack: function (move) {
            convertFirebase(game.$child('rounds')).$then(function (rounds) {
              var lastIndex = rounds.$getIndex()[rounds.$getIndex().length-1];
              var lastRound = rounds[lastIndex];
              if (lastRound && Object.keys(lastRound).length < Object.keys(game.players).length) {
                lastRound[userId] = move;
                rounds.$save(lastIndex);

                if (Object.keys(lastRound).length == Object.keys(game.players).length) {
                  game.state = {
                    name: "waiting_move"
                  };
                  game.$save('state');

                  // Fight
                  var opponentId = null;
                  Object.keys(game.players).forEach(function (id) {
                    if (userId != id) {
                      opponentId = id;
                    }
                  });
                  var result = Moves.damageMatrix(lastRound[userId].name, lastRound[opponentId].name);
                  game.players[userId].health -= result[0];
                  game.players[opponentId].health -= result[1];

                  Object.keys(game.players).forEach(function (userId) {
                    game.players[userId].notSeenAnimation = lastIndex;
                  });
                  game.$save('players');
                }
              } else {
                var data = {};
                data[userId] = move;
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
