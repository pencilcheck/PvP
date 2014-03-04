'use strict';

angular.module('PvP')
  .controller('GameCtrl', function ($scope, $routeParams, Game) {
    $scope.status = Game.status();
    $scope.moves = Game.moves;
    $scope.player = Game.player;
    $scope.opponent = Game.opponent;
    $scope.game = Game.meta;
    $scope.log = Game.log;

    $scope.$watch('status', function (newVal) {
      switch (newVal) {
      case 'waiting_join':
        $scope.view = 'views/game/preGame.html';
        break;
      case 'waiting_pick':
        $scope.view = 'views/game/selectMoves.html';
        break;
      case 'waiting_move':
        $scope.view = 'views/game/fightScene.html';
        break;
      case 'waiting_other_pick':
        $scope.view = 'views/game/fightScene.html';
        break;
      case 'waiting_other_move':
        $scope.view = 'views/game/fightScene.html';
        break;
      case 'not_seen_animation':
        $scope.view = 'views/game/fightScene.html';
        break;
      case 'game_ended':
        $scope.view = 'views/game/endGame.html';
        break;
      default:
        return 'Cowabunga!';
        break;
      }
    });

    // Select Moves Stage
    $scope.isSelected = function(move) {
      return $scope.selectedMoves[move];
    };

    $scope.selectMove = function(move) {
      $scope.player.selectedMoves[move.name] = move;
    };

    $scope.deselectMove = function(move) {
      delete $scope.player.selectedMoves[move.name];
    };

    $scope.doneSelectingMoves = function () {
      $scope.log.push($scope.player.displayName + ' has picked moves');
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
        $scope.meta.$save('state');
        $('button').attr('disabled', 'disabled');
      });
    };

    // Fight Scene Stage
  });
