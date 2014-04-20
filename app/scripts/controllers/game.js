'use strict'

angular.module('PvP')
  .controller('GameCtrl', function ($scope, $rootScope, $timeout, $location, $routeParams, $modal, currentUser, Games, GameStates, game, Moves, rematchRequests, Facebook, pvpSync) {

    $rootScope.$on('$routeChangeError', function () {
      $location.path('/')
    })

    function stateHandler(state) {
      $scope.safeApply(function () {
        switch (state) {
        case GameStates.opened:
          console.log('Just opened the game, need to invite people: to invitePlayers')
          $scope.viewUrl = 'views/game/invitePlayers.html'
          setupInvitePlayers()
          break
        case GameStates.invitesSent:
          console.log('Just sent all invitations, waiting to others to redeem: to preGame')
          $scope.viewUrl = 'views/game/preGame.html'
          break
        case GameStates.started:
          console.log('All players have redeemed, start picking moves: to selectMoves')
          $scope.viewUrl = 'views/game/selectMoves.html'
          setupSelectMoves()
          break
        case GameStates.movesPicked:
          console.log('All players have selected moves, fight: to fightScene')
          $scope.viewUrl = 'views/game/fightScene.html'
          setupFightScene()
          break
        case GameStates.finished:
          // The first time loading
          if (!$scope.viewUrl) {
            console.log('Someone died: to endGame')
            $scope.viewUrl = 'views/game/endGame.html'
            setupEndGame()
          }
          break
        default:
          break
        }
      })
    }

    function setupInvitePlayers() {
      Facebook.api('/me/friends', 'get', {
        fields: 'id, name, picture',
        access_token: currentUser.accessToken
      }, function (response) {
        $scope.friends = response.data
        //$scope.friends.map(function (friend, index) {
          //Facebook.api('/' + friend.id + '/picture', function (response) {
            //$scope.friends[index].picture = response.data
          //})
          //return friend
        //})
      })
    }

    game.raw().$onChange('state', stateHandler)
    stateHandler(game.raw().state)

    function participantsHandler(participants) {
      function allMovesCommitted() {
        var ret = true
        _.keys(participants).forEach(function (key) {
          if (!participants[key].movesCommitted)
            ret = false
        })
        return ret
      }

      if (game.raw().state == GameStates.started && allMovesCommitted()) {
        game.raw().state = GameStates.movesPicked
        game.$save()
      }
    }

    // This watcher looks at the participants, if it is a open game and full, it
    // will proceed to the next state to start the game to pick moves
    game.raw().$onChange('participants', participantsHandler)
    participantsHandler(game.raw().participants)

    // Skip invitation and make the game public
    $scope.inviteNoop = function () {
      game.raw().state = GameStates.invitesSent
      game.$save()
    }

    function setupSelectMoves() {
      console.log('setupSelectMoves')
      game.player(currentUser.uid).selectedMoves = game.player(currentUser.uid).selectedMoves || {}
      game.player(currentUser.uid).movesCommitted = game.player(currentUser.uid).movesCommitted || false
      $scope.moves = Moves.moves
      $scope.selectedMoves = angular.copy(game.player(currentUser.uid).selectedMoves)
      $scope.movesCommitted = angular.copy(game.player(currentUser.uid).movesCommitted)

      $scope.selectedMovesCount = function () {
        return _.keys($scope.selectedMoves).length
      }

      $scope.isSelected = function(key) {
        return $scope.selectedMoves && _.has($scope.selectedMoves, key)
      }

      $scope.selectMove = function(key) {
        if ($scope.selectedMovesCount() < 3)
          $scope.selectedMoves[key] = angular.copy($scope.moves[key])
      }

      $scope.unselectMove = function(key) {
        delete $scope.selectedMoves[key]
      }

      $scope.commitSelectedMoves = function () {
        if ($scope.selectedMovesCount() == 3) {
          $scope.movesCommitted = game.player(currentUser.uid).movesCommitted = true
          game.player(currentUser.uid).selectedMoves = $scope.selectedMoves
          game.$save()
        }
      }
    }

    // Don't save game here
    function determineWinner(health, opponentHealth, damageToCurrentUser, damageToOpponent) {
      if (health <= 0 || opponentHealth <= 0) {
        if (health > 0) {
          game.raw().winner = currentUser.uid
        } else if (opponentHealth > 0) {
          game.raw().winner = game.opponentOf(currentUser.uid).uid
        } else {
          // Both players have negative health
          if (Math.abs(damageToCurrentUser) > Math.abs(damageToOpponent)) {
            game.raw().winner = game.opponentOf(currentUser.uid).uid
          } else if (Math.abs(damageToCurrentUser) < Math.abs(damageToOpponent)) {
            game.raw().winner = currentUser.uid
          } else {
            // TODO: Draw
          }
        }
      }
    }

    $scope.$watch('notSeenAnimation', function (newVal, oldVal) {
      if (!newVal && oldVal) {
        console.log('Reset smackTalk, and opponent')
        $scope.form = {}
        $scope.opponentSmackTalk = ''
        $scope.attack = $scope.opponentAttack = null

        // If there is a winner jump to final screen
        if (game.raw().winner) {
          game.raw().state = GameStates.finished
          game.$save()

          console.log('Someone died: to endGame')
          $scope.viewUrl = 'views/game/endGame.html'
          setupEndGame()

          var winner = pvpSync('/players/' + game.raw().winner)
          winner.$promise.then(function () {
            winner.wins = winner.wins || []
            if (winner.wins.indexOf(game.raw().$id)) {
              winner.wins.push(game.raw().$id)
              winner.$save()
            }
          })

          var loser = pvpSync('/players/' + game.opponentOf(game.raw().winner).uid)
          loser.$promise.then(function () {
            loser.loses = loser.loses || []
            if (loser.loses.indexOf(game.raw().$id)) {
              loser.loses.push(game.raw().$id)
              loser.$save()
            }
          })
        }
      }
    })

    function currentRoundHandler(currentRound) {
      console.log('currentRound onChange')
      function allAttackCommitted() {
        return _.keys(currentRound).length == _.keys(game.raw().participants).length
      }

      if (game.raw().state == GameStates.movesPicked) {
        if (allAttackCommitted()) {
          console.log('all committed')
          $scope.notSeenAnimation = true

          var opponentUid = game.opponentOf(currentUser.uid).uid
          $scope.opponentAttack = Moves.moves[game.raw().currentRound[opponentUid].moveKey]
          $scope.opponentSmackTalk = game.raw().currentRound[opponentUid].smackTalk

          // Take damage
          var result = Moves.damageMatrix(Moves.moves[currentRound[currentUser.uid].moveKey].name, Moves.moves[currentRound[game.opponentOf(currentUser.uid).uid].moveKey].name)

          if (result[0] > 0)
            game.player(currentUser.uid).health -= result[0]

          if (result[1] > 0)
            game.opponentOf(currentUser.uid).health -= result[1]

          console.log('move damage results', result)

          currentRound.log = Moves.textualizeAttack(game.player(currentUser.uid).name, game.opponentOf(currentUser.uid).name, Moves.moves[currentRound[currentUser.uid].moveKey].name, Moves.moves[currentRound[game.opponentOf(currentUser.uid).uid].moveKey].name, result[0], result[1])

          determineWinner(game.player(currentUser.uid).health, game.opponentOf(currentUser.uid).health, result[0], result[1])

          game.raw().rounds.push(angular.copy(currentRound))
          game.raw().currentRound = {}
          game.$save()
          // Doesn't really matter to reset the smackTalk or not
        }
        determineDialog()
      }
    }

    game.raw().$onChange('currentRound', currentRoundHandler)
    currentRoundHandler(game.raw().currentRound)

    function roundsHandler(rounds) {
      // This one is only for display purposes
      // Angular ng-repeat will add $$hashKey which firebase don't like
      $timeout(function () {
        $scope.rounds = angular.copy(rounds)
        console.log('rounds', $scope.rounds)
      })
    }

    game.raw().$onChange('rounds', roundsHandler)
    roundsHandler(game.raw().rounds)

    function healthHandler(participants) {
      if (game.raw().state >= GameStates.movesPicked) {
        $scope.health = game.player(currentUser.uid).health
        $scope.opponentHealth = game.opponentOf(currentUser.uid).health
        console.log('update health', $scope.health, $scope.opponentHealth)
      }
    }

    game.raw().$onChange('participants', healthHandler)
    healthHandler(game.raw().participants)

    function determineDialog() {
      if ($scope.attackCommitted() && !$scope.notSeenAnimation)
        $scope.dialog = 'Waiting on your opponent...'
      else
        $scope.dialog = 'What should ' + game.player(currentUser.uid).name + ' do?'
    }

    function setupFightScene() {
      console.count('setupFightScene')
      game.raw().rounds = game.raw().rounds || []
      game.raw().currentRound = game.raw().currentRound || {}

      $scope.notSeenAnimation = false

      $scope.form = {}
      $scope.opponentSmackTalk = ''
      $scope.attack = $scope.opponentAttack = null
      if (game.raw().currentRound[currentUser.uid]) {
        $scope.form.smackTalk = game.raw().currentRound[currentUser.uid].smackTalk
        $scope.attack = Moves.moves[game.raw().currentRound[currentUser.uid].moveKey]
      }

      $scope.attackCommitted = function () {
        return game.raw().currentRound && _.has(game.raw().currentRound, currentUser.uid) || $scope.notSeenAnimation
      }

      $scope.replayAnimation = function () {
      }

      $scope.skipAnimation = function () {
        $scope.notSeenAnimation = false
      }

      determineDialog()

      $scope.selectedMoves = game.player(currentUser.uid).selectedMoves

      $scope.health = game.player(currentUser.uid).health
      $scope.opponentHealth = game.opponentOf(currentUser.uid).health

      $scope.fight = function (key, smackTalk) {
        game.raw().currentRound = game.raw().currentRound || {}
        game.raw().currentRound[currentUser.uid] = {
          moveKey: key,
          smackTalk: smackTalk
        }
        game.$save()
        $scope.form.smackTalk = angular.copy(smackTalk)
        $scope.attack = angular.copy(Moves.moves[key])
        console.log('attacking with attack and smackTalk', $scope.attack, $scope.form.smackTalk)
      }

      $scope.dice = function () {
      }
    }

    function rematchHandler(requests) {
      if (game.raw().state >= GameStates.finished) {
        console.log('rematchRequests $onChange', requests)
        console.log('getIndex', requests.$getIndex())
        requests.$getIndex().forEach(function (key) {
          var request = requests[key]

          if (request.from == currentUser.uid && 
                request.to == game.opponentOf(currentUser.uid).uid && 
                request.response && 
                !request.gameId) {
            if (request.response == 'accept') {
              var opponent = game.opponentOf(currentUser.uid)
              Games.create({
                host: currentUser.uid,
                title: 'A Rematch from ' + currentUser.name + ' to ' + opponent.name,
                description: 'Best game ever',
              }).then(function (newGame) {
                // Has to invite host itself too
                newGame.$invite([currentUser, opponent]).then(function () {
                  newGame.$redeem(currentUser).then(function () {
                    request.gameId = newGame.raw().$id
                    rematchRequests.$save().then(function () {
                      $location.path('/game/' + newGame.raw().$id);
                      //$window.location.href = '/#/game/' + newGame.raw().$id
                    })
                  }, function (reason) {
                    alert(reason);
                  })
                }, function (reason) {
                  alert(reason);
                })
              }, function (reason) {
                alert(reason)
              });
            } else if (request.response == 'reject') {
              delete requests[key]
              rematchRequests.$save()
            }
          } else if (request.to == currentUser.uid && 
                request.from == game.opponentOf(currentUser.uid).uid &&
                !_.has(request, 'response')) {
            console.log('Received a rematch request!')
            $modal.open({
              backdrop: 'static',
              keyboard: false,
              templateUrl: 'views/game/modal/requestRematch.html',
              controller: function ($scope, $modalInstance) {
                $scope.requester = request.from

                $scope.accept = function () {
                  console.log('[MODAL] accepting request', request)
                  request.response = 'accept'
                  rematchRequests.$save()
                  $modalInstance.close()
                }

                $scope.reject = function () {
                  console.log('[MODAL] rejecting request', request)
                  request.response = 'reject'
                  rematchRequests.$save()
                  $modalInstance.close()
                }
              }
            })
          } else if (request.to == currentUser.uid && 
                request.from == game.opponentOf(currentUser.uid).uid &&
                _.has(request, 'response') && 
                request.response == 'accept' && 
                _.has(request, 'gameId')) {
            // Listening on gameId
            delete requests[key]
            rematchRequests.$save().then(function () {
              Games.get(request.gameId).then(function (game) {
                game.$redeem(currentUser).then(function (game) {
                  $location.path('/game/' + game.raw().$id);
                  //$window.location.href = '/#/game/' + game.raw().$id
                }, function (reason) {
                  alert(reason);
                });
              })
            })
          }
        })
      }
    }

    rematchRequests.$onChange('', rematchHandler)
    rematchHandler(rematchRequests)

    function setupEndGame() {
      $scope.winner = game.player(game.raw().winner)
      $scope.rematch = function () {
        var requestObj = {
          from: currentUser.uid,
          to: game.opponentOf(currentUser.uid).uid,
          fromGameId: $routeParams.gameId,
        }

        var duplicates = false
        rematchRequests.$getIndex().forEach(function (key) {
          if (_.isEqual(rematchRequests[key], requestObj)) {
            duplicates = true
          }
        })
        if (!duplicates)
          rematchRequests.$push(requestObj)
      }
      $scope.toLobby = function () {
        $location.path('/')
      }
    }
  })
