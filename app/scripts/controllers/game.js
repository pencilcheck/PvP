'use strict';

angular.module('PvP')
  .controller('GameCtrl', function ($scope, $routeParams, $modal, gameConfig, Moves, convertFirebase) {
    $scope.moves = Moves.all();
    $scope.players = gameConfig.players;
    $scope.game = gameConfig.game;
    $scope.rounds = gameConfig.rounds;
    $scope.state = gameConfig.state;

    function switchState(newVal, oldVal) {
      if (newVal != oldVal) {
        switch (newVal.name) {
        case 'waiting_join':
          $scope.viewUrl = 'views/game/preGame.html';
          break;
        case 'waiting_pick':
          $scope.viewUrl = 'views/game/selectMoves.html';
          break;
        case 'waiting_move':
          $scope.viewUrl = 'views/game/fightScene.html';
          $scope.dialog = 'What should ' + $scope.currentPlayer().name + ' do?';
          break;
        case 'waiting_other_move':
          $scope.viewUrl = 'views/game/fightScene.html';
          if (newVal.detail == $scope.currentPlayer().uid) {
            $scope.dialog = 'Waiting on your opponent';
          }
          break;
        case 'game_ended':
          $scope.viewUrl = 'views/game/endGame.html';
          $scope.winner = newVal.detail

          gameConfig.hasRematchRequestFromOpponent().then(function (request) {
            if (request) {
              $modal.open({
                backdrop: 'static',
                keyboard: false,
                templateUrl: 'views/game/modal/requestRematch.html',
                controller: function ($scope, $modalInstance) {
                  $scope.requester = request.requester

                  $scope.accept = function () {
                    gameConfig.acceptRematchRequest()
                    $modalInstance.close();
                  };

                  $scope.reject = function () {
                    gameConfig.rejectRematchRequest()
                    $modalInstance.close();
                  };
                }
              });
            }
          })
          break;
        default:
          break;
        }
      }
    }

    gameConfig.onChange('state', switchState);
    $scope.$watch('state', switchState);

    $scope.$watch('currentPlayer().notSeenAnimation', function (newVal) {
      if (newVal) {
        $modal.open({
          backdrop: 'static',
          keyboard: false,
          templateUrl: '/views/game/modal/animation.html',
          controller: function ($scope, $modalInstance) {
            $scope.skip = function () {
              gameConfig.currentPlayer().notSeenAnimation = null;
              gameConfig.game.$save('players');
              $modalInstance.close();
            };

            $scope.play = function () {
              gameConfig.currentPlayer().notSeenAnimation = null;
              gameConfig.game.$save('players');
              $modalInstance.close();
            };
          }
        });
      }
    }, true);

    //$scope.$watch('rounds.$getIndex().length', function () {
      //$scope.dialog = 'What should ' + $scope.currentPlayer().name + ' do?';
    //});

    $scope.currentPlayer = function () {
      return gameConfig.currentPlayer();
    };

    $scope.opponentPlayer = function () {
      return gameConfig.opponentPlayer();
    };

    // Select Moves Stage
    $scope.isSelected = function(move) {
      return $scope.currentPlayer().selectedMoves && $scope.currentPlayer().selectedMoves[move];
    };

    $scope.selectMove = function(move) {
      gameConfig.commitMove(move);
    };

    $scope.deselectMove = function(move) {
      delete $scope.currentPlayer().selectedMoves[move.name];
    };

    $scope.doneSelectingMoves = function () {
      gameConfig.doneCommitMoves();
      $('button').attr('disabled', 'disabled');
    };

    // Fight Scene Stage
    $scope.currentRound = function () {
      var count = 0;
      $scope.rounds.$getIndex().forEach(function (index) {
        if ($scope.rounds[index] && $scope.players && Object.keys($scope.rounds[index]).length == Object.keys($scope.players).length) {
          count += 1;
        }
      });
      return count;
    }

    $scope.replayAnimation = function () {
    };

    $scope.skipAnimation = function () {
    };

    $scope.fight = function (move) {
      gameConfig.commitAttack(move);
      $scope.dialog = $scope.currentPlayer().name + " selected " + move.name;
    };

    $scope.feelingLucky = function () {
    };

    // End Scene
    $scope.rematch = function () {
      gameConfig.hasRematchRequestFromOpponent().then(function (request) {
        if (!request) {
          gameConfig.requestRematch();
        } else {
          // auto accept
          gameConfig.acceptRematchRequest(request.id);
        }
      })
    };
  });
