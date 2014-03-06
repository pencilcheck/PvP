'use strict';

angular.module('PvP')
  .controller('GameCtrl', function ($scope, $routeParams, gameConfig) {
    $scope.status = gameConfig.status();
    $scope.moves = gameConfig.moves;
    $scope.players = gameConfig.players;
    $scope.game = gameConfig.meta;
    $scope.log = gameConfig.log;
    $scope.state = gameConfig.state;

    $scope.$watch('state', function (newVal) {
      switch (newVal.name) {
      case 'waiting_join':
        $scope.viewUrl = 'views/game/preGame.html';
        break;
      case 'waiting_pick':
        $scope.viewUrl = 'views/game/selectMoves.html';
        break;
      case 'waiting_move':
        $scope.viewUrl = 'views/game/fightScene.html';
        break;
      case 'waiting_other_pick':
        $scope.viewUrl = 'views/game/fightScene.html';
        break;
      case 'waiting_other_move':
        $scope.viewUrl = 'views/game/fightScene.html';
        break;
      case 'not_seen_animation':
        $scope.viewUrl = 'views/game/fightScene.html';
        break;
      case 'game_ended':
        $scope.viewUrl = 'views/game/endGame.html';
        break;
      default:
        return 'Cowabunga!';
        break;
      }
    });

    $scope.currentPlayer = function () {
      return gameConfig.currentPlayer();
    };

    $scope.opponentPlayer = function () {
      return gameConfig.opponentPlayer();
    };

    // Select Moves Stage
    $scope.isSelected = function(move) {
      return $scope.selectedMoves[move];
    };

    $scope.selectMove = function(move) {
      $scope.currentPlayer().selectedMoves[move.name] = move;
    };

    $scope.deselectMove = function(move) {
      delete $scope.currentPlayer().selectedMoves[move.name];
    };

    $scope.doneSelectingMoves = function () {
      $scope.log.push($scope.currentPlayer().displayName + ' has picked moves');
      $scope.meta.$save('log');
      $scope.meta.$save('player').then(function () {
        // FIXME: update meta.state from firebase before checking
        if ($scope.meta.state.name == 'waiting_pick') {
          if ($scope.meta.state.detail == 'both') {
            $scope.meta.state = {
              name: 'waiting_pick',
              detail: $scope.player.uid
            };
          } else if ($scope.meta.state.detail != $scope.player.uid) {
            $scope.meta.state = {
              name: 'waiting_move',
              detail: 'both'
            };
          }
        }
        $scope.meta.$save('state');
        $('button').attr('disabled', 'disabled');
      });
    };

    // Fight Scene Stage
  });
