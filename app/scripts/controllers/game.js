'use strict';

angular.module('PvP')
  .controller('GameCtrl', function ($scope, $routeParams, $modal, gameConfig, Moves) {
    $scope.status = gameConfig.status();
    $scope.moves = Moves.all();
    $scope.players = gameConfig.players;
    $scope.game = gameConfig.game;
    $scope.rounds = gameConfig.rounds;
    $scope.log = gameConfig.log;
    $scope.state = gameConfig.state;

    function switchState(newVal) {
      if (newVal) {
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
          $scope.dialog = 'Waiting on your opponent';
          break;
        case 'game_ended':
          $scope.viewUrl = 'views/game/endGame.html';
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
          templateUrl: 'animationModal.html',
          controller: function ($scope, $modalInstance) {
            $scope.skip = function () {
              $modalInstance.close();
            };

            $scope.play = function () {
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

    // Select Moves Stage
    $scope.isSelected = function(move) {
      return $scope.currentPlayer().selectedMoves && $scope.currentPlayer().selectedMoves[move];
    };

    $scope.selectMove = function(move) {
      $scope.currentPlayer().selectedMoves = $scope.currentPlayer().selectedMoves || {};
      $scope.currentPlayer().selectedMoves[move.name] = move;
    };

    $scope.deselectMove = function(move) {
      delete $scope.currentPlayer().selectedMoves[move.name];
    };

    $scope.doneSelectingMoves = function () {
      $scope.game.$save('players').then(function () {
        // FIXME: update game.state from firebase before checking
        if ($scope.game.state.name == 'waiting_pick') {
          if ($scope.game.state.detail == 'both') {
            $scope.game.state = {
              name: 'waiting_pick',
              detail: $scope.currentPlayer().uid
            };
          } else if ($scope.game.state.detail != $scope.currentPlayer().uid) {
            $scope.game.state = {
              name: 'waiting_move',
              detail: 'both'
            };
          }
        }
        $scope.game.$save('state');
        $('button').attr('disabled', 'disabled');
      });
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
  });
