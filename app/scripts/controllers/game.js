'use strict';

angular.module('PvP')
  .controller('GameCtrl', function ($scope, $routeParams, gameConfig) {
    $scope.status = gameConfig.status();
    $scope.moves = gameConfig.moves;
    $scope.players = gameConfig.players;
    $scope.game = gameConfig.game;
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
        $scope.dialog = 'What should ' + $scope.currentPlayer().name + ' do?';
        break;
      case 'waiting_other_move':
        $scope.viewUrl = 'views/game/fightScene.html';
        $scope.dialog = 'Waiting on your opponent ' + $scope.currentPlayer().name;
        break;
      case 'not_seen_animation':
        $scope.viewUrl = 'views/game/fightScene.html';
        break;
      case 'game_ended':
        $scope.viewUrl = 'views/game/endGame.html';
        break;
      default:
        break;
      }
    });

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
    $scope.fight = function (move) {
    };

    $scope.feelingLucky = function () {
    };
  });
