'user strict'

angular.module('PvP')
  .factory('Game', function ($window, $location, $rootScope, $routeParams, $q, Games, Moves, Channel, $firebase, firebaseUrl, convertFirebase, UserSession) {
    var games = Games.all(),
        meta = Games.get(),
        log = [],
        requestsReq = $firebase(new Firebase(firebaseUrl + 'rematchRequests'))

    function getOpponentId(players, userId) {
      var opponentId = null
      Object.keys(players).forEach(function (id) {
        if (userId != id) {
          opponentId = id
        }
      })
      return opponentId
    }

    function getCurrentRound(game) {
      return convertFirebase(game.$child('rounds')).$then(function (rounds) {
        var index = rounds.$getIndex().slice(-1)[0]

        if (index && rounds[index] && rounds[index].move && Object.keys(rounds[index].move).length < Object.keys(game.players).length) {
          return convertFirebase(rounds.$child(index)).$then(function (round) {
            return round
          })
        } else {
          return rounds.$add({move: {}, log: ''}).then(function (round) {
            return $firebase(round)
          })
        }
      })
    }

    return function (gameId, userId) {
      return Games.get(gameId).$then(function (game) {
        var o = {
          onChange: function (attr, cb) {
            game.$child(attr).$on('change', function () {
              cb(game[attr])
            })
          },
          game: game,
          players: game.players,
          opponentPlayer: function () {
            var opponentId = null
            Object.keys(game.players).forEach(function (id) {
              if (userId != id) {
                opponentId = id
              }
            })
            return game.players[opponentId]
          },
          currentPlayer: function () {
            return game.players[userId]
          },
          turnOffListeners: function () {
            requestsReq.$off()
          },
          state: game.state,
          rounds: game.$child('rounds'),
          acceptRematchRequest: function (request) {
            console.log('accept request', request)
            if (request) {
              request.response = 'accept'
              request.$save().then(function () {
                request.$on('change', function () {
                  if (request.gameId) {
                    request.$off()
                    requestsReq.$off()
                    console.log('requester has created a new game', request.gameId)
                    // joins the game
                    Games.join(request.gameId).then(function () {
                      console.log('joins the game')
                      request.$remove().then(function () {
                        // Have to force it
                        $window.location.href = '/#/game/' + request.gameId
                      })
                    })
                  }
                })
              })
            }
          },
          rejectRematchRequest: function (request) {
            console.log('reject', request)
            if (request) {
              console.log('reject rematch request', request)
              // FIXME: request has no $update method
              request.response = 'reject'
              request.$save()
            }
          },
          requestRematch: function () {
            console.log('requesting rematch')
            var self = this,
                opponentId = getOpponentId(game.players, userId)

            requestsReq.$add({
              requester: userId,
              userToRematch: opponentId,
              fromGameId: gameId,
              response: null
            })
          },
          listenOnRematchRequests: function (callbacks) {
            console.log('listenOnRematchRequests')
            var self = this,
                opponentId = getOpponentId(game.players, userId)
            
            function onChange() {
              convertFirebase(requestsReq).$then(function (requests) {
                console.log('onChange')
                requests.$getIndex().forEach(function (key) {

                  // Responded
                  if (requests[key].requester == userId && requests[key].userToRematch == opponentId && requests[key].fromGameId == gameId && requests[key].response && !requests[key].gameId) { // No gameId
                    console.log('hasResponse', requests[key])
                    convertFirebase(requests.$child(key)).$then(function (request) {
                        callbacks.hasResponse(request)
                    })
                  }

                  // Request
                  if (requests[key].requester == opponentId && requests[key].userToRematch == userId && requests[key].fromGameId == gameId && !requests[key].response) {
                    console.log('hasRequest', requests[key])
                    convertFirebase(requests.$child(key)).$then(function (request) {
                        callbacks.hasRequest(request)
                    })
                  }
                })
              })
            }
            onChange()

            requestsReq.$on('change', function () {
              console.log('requestsReq onChange')
              onChange()
            })
          },
          uncommitMove: function (move) {
            convertFirebase(game.$child('players').$child(userId)).$then(function (player) {
              var moves = player.selectedMoves || {}
              delete moves[move.name]
              player.selectedMoves = moves
              player.$save()
              return player
            })
          },
          commitMove: function (move) {
            convertFirebase(game.$child('players').$child(userId)).$then(function (player) {
              var moves = player.selectedMoves || {}
              moves[move.name] = move
              player.selectedMoves = moves
              player.$save()
              return player
            })
          },
          doneCommitMoves: function () {
            // FIXME: update game.state from firebase before checking
            if (game.state.name == 'waiting_pick') {
              if (game.state.detail == 'both') {
                game.state = {
                  name: 'waiting_pick',
                  detail: userId
                }
              } else if (game.state.detail != userId) {
                game.state = {
                  name: 'waiting_move',
                  detail: 'both'
                }
              }
            }
            game.$save('state')

            this.currentPlayer().movesCommitted = true;
            game.$save('players')
          },
          getLastestSmackTalk: function () {
            return getCurrentRound(game).then(function (round) {
              return round.smackTalk ? round.smackTalk[userId] : ''
            })
          },
          getLastestSelectedAttack: function () {
            return getCurrentRound(game).then(function (round) {
              return round.move ? round.move[userId] : null
            })
          },
          commitAttack: function (move, smackTalk) {
            var self = this

            getCurrentRound(game).then(function (round) {
              round.move = round.move || {}
              round.smackTalk = round.smackTalk || {}

              if (round.move && !round.move[userId] || !round.move) {
                round.move[userId] = move
                round.smackTalk[userId] = smackTalk

                if (Object.keys(round.move).length < Object.keys(game.players).length) {
                  game.state = {
                    name: "waiting_other_move",
                    detail: userId
                  }
                } else if (Object.keys(round.move).length == Object.keys(game.players).length) {
                  var opponentId = getOpponentId(game.players, userId),
                      result = Moves.damageMatrix(round.move[userId].name, round.move[opponentId].name)
                  console.log('result of damage', result);

                  round.log = Moves.textualizeAttack(game.players[userId].name, game.players[opponentId].name, round.move[userId].name, round.move[opponentId].name, result[0], result[1])

                  game.players[userId].health -= result[0]
                  game.players[opponentId].health -= result[1]

                  game.players[userId].notSeenAnimation = true
                  game.players[opponentId].notSeenAnimation = true
                  game.$save('players')

                  if (game.players[userId].health <= 0 || game.players[opponentId].health <= 0) {
                    game.state = {
                      name: "game_ended"
                    }

                    var winnerId
                    if (game.players[userId].health > 0) {
                      winnerId = userId
                    } else if (game.players[opponentId].health > 0) {
                      winnerId = opponentId
                    } else {
                      // Both players have negative health
                      if (Math.abs(result[0]) > Math.abs(result[1])) {
                        winnerId = opponentId
                      } else if (Math.abs(result[0]) < Math.abs(result[1])) {
                        winnerId = userId
                      }
                    }

                    game.state.detail = game.players[winnerId]
                  } else {
                    game.state = {
                      name: "waiting_move"
                    }
                  }
                }

                round.$save()
                game.$save('state')

                self.currentPlayer().attackCommitted = true;
                game.$save('players')
              }
            })
          }
        }


        o.watch('game', function (id, oldVal, newVal) {
          // Update to server
          Games.g.$save(gameId)
        })

        o.watch('players', function (id, oldVal, newVal) {
          // Update to server
          Games.g.$save(gameId)
        })

        return o
      })
    }
  })
