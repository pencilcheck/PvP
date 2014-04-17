'use strict'

angular.module('PvP')
  .controller('GameCtrl', function ($window, $location, $firebase, $scope, $routeParams, $modal, UserSession, Games, gameConfig, Moves, convertFirebase) {
    $scope.moves = Moves.all()
    $scope.players = gameConfig.players
    $scope.game = gameConfig.game
    $scope.rounds = gameConfig.rounds
    $scope.state = gameConfig.state
    $scope.rematchModal = null
    $scope.attackCommitted = function () {
      return gameConfig.currentPlayer().attackCommitted
    };
    $scope.movesCommitted = function () {
      return gameConfig.currentPlayer().movesCommitted
    };

    function switchState(newVal, oldVal) {
      if (newVal != oldVal) {
        switch (newVal.name) {
        case 'waiting_join':
          $scope.viewUrl = 'views/game/preGame.html'
          break
        case 'waiting_pick':
          $scope.viewUrl = 'views/game/selectMoves.html'
          break
        case 'waiting_move':
          $scope.currentPlayer().attackCommitted = false;
          $scope.game.$save('players')
          $scope.viewUrl = 'views/game/fightScene.html'
          $scope.dialog = 'What should ' + $scope.currentPlayer().name + ' do?'
          break
        case 'waiting_other_move':
          $scope.viewUrl = 'views/game/fightScene.html'
          if (newVal.detail == $scope.currentPlayer().uid) {
            $scope.dialog = 'Waiting on your opponent'
          }
          break
        case 'game_ended':
          $scope.viewUrl = 'views/game/endGame.html'
          $scope.winner = newVal.detail

          gameConfig.listenOnRematchRequests({
            hasResponse: function (request) {
              console.log('hasResponse', request)

              if (request.response == 'accept') {
                console.log('opponent has accepted the request')
                request.$off()
                gameConfig.turnOffListeners()
                // create a new game
                Games.create({
                  title: 'Rematch',
                  description: 'Best game ever',
                }).then(function (id) {
                  request.gameId = id
                  request.$save().then(function () {
                    $window.location.href = '/#/game/' + id
                  })
                })
              } else if (request.response == 'reject') {
                console.log('opponent has rejected the request')
                // TODO: show user the response
                request.$remove()
              }
            },
            hasRequest: function (request) {
              console.log('hasRequest', request)
              var outScope = $scope
              if (!$scope.rematchModal) {
                $scope.rematchModal = $modal.open({
                  backdrop: 'static',
                  keyboard: false,
                  templateUrl: 'views/game/modal/requestRematch.html',
                  controller: function ($scope, $modalInstance) {
                    $scope.requester = request.requester

                    $scope.accept = function () {
                      console.log('[MODAL] accepting request', request)
                      gameConfig.acceptRematchRequest(request)
                      outScope.rematchModal = null
                      $modalInstance.close()
                    }

                    $scope.reject = function () {
                      console.log('[MODAL] rejecting request', request)
                      gameConfig.rejectRematchRequest(request)
                      outScope.rematchModal = null
                      $modalInstance.close()
                    }
                  }
                })
              }
            }
          })
          break
        default:
          break
        }
      }
    }

    gameConfig.onChange('state', switchState)
    $scope.$watch('state', switchState)

    $scope.$watch('currentPlayer().notSeenAnimation', function (newVal) {
      $scope.currentPlayer().attackCommitted = false;
      $scope.game.$save('players')
      if (newVal) {
        $modal.open({
          backdrop: 'static',
          keyboard: false,
          templateUrl: '/views/game/modal/animation.html',
          controller: function ($scope, $modalInstance) {
            $scope.skip = function () {
              gameConfig.currentPlayer().notSeenAnimation = null
              gameConfig.game.$save('players')
              $modalInstance.close()
            }

            $scope.play = function () {
              gameConfig.currentPlayer().notSeenAnimation = null
              gameConfig.game.$save('players')
              $modalInstance.close()
            }
          }
        })
      }
    }, true)

    //$scope.$watch('rounds.$getIndex().length', function () {
      //$scope.dialog = 'What should ' + $scope.currentPlayer().name + ' do?'
    //})

    $scope.currentPlayer = function () {
      return gameConfig.currentPlayer()
    }

    $scope.opponentPlayer = function () {
      return gameConfig.opponentPlayer()
    }

    // Select Moves Stage
    $scope.isSelected = function(move) {
      return $scope.currentPlayer().selectedMoves && $scope.currentPlayer().selectedMoves[move.name]
    }

    $scope.selectedMovesCount = function () {
      return $scope.currentPlayer().selectedMoves ? Object.keys($scope.currentPlayer().selectedMoves).length : 0
    }

    $scope.selectMove = function(move) {
      if ($scope.selectedMovesCount() < 3) {
        gameConfig.commitMove(move)
      }
    }

    $scope.unselectMove = function(move) {
      gameConfig.uncommitMove(move)
    }

    $scope.doneSelectingMoves = function () {
      gameConfig.doneCommitMoves()
    }

    // Fight Scene Stage
    $scope.currentRound = function () {
      var count = 0
      $scope.rounds.$getIndex().forEach(function (index) {
        if ($scope.rounds[index] && $scope.players && Object.keys($scope.rounds[index]).length == Object.keys($scope.players).length) {
          count += 1
        }
      })
      return count
    }

    $scope.replayAnimation = function () {
    }

    $scope.skipAnimation = function () {
    }

    $scope.fight = function (move, smackTalk) {
      gameConfig.commitAttack(move, smackTalk)
      $scope.dialog = $scope.currentPlayer().name + " selected " + move.name
    }

    $scope.feelingLucky = function () {
    }

    // End Scene
    $scope.rematch = function () {
      gameConfig.requestRematch()
    }
  })
