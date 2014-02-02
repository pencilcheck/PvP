'use strict';

angular.module('planetRusApp')
  .controller('MovesCtrl', function ($scope, $firebase, firebaseUrl, UserSession) {

    $scope.moves = $firebase(new Firebase(firebaseUrl + 'moves'));

    $scope.generateDamageTo = function(moveName, moves) {
      var result = [];
      var keys = moves.$getIndex();
      keys.forEach(function(key, i) {
        result.push({name: moves[key].name, damage: 0});
      });
      // To itself
      result.push({name: moveName, damage: 0});

      return result;
    };

    $scope.addNewDamageToOf = function(move, newMove) {
      move.damageTo.push({name: newMove, damage: 0})
    };

    $scope.duplicate = function(newMove, moves) {
      var keys = moves.$getIndex();
      keys.forEach(function(key, i) {
        if(newMove == moves[key].name)
          return true;
      });
      return false;
    };

    $scope.addOne = function(newMove) {
      if(!$scope.duplicate(newMove, $scope.moves)) {
        var moveObj = {
          name: newMove,
          damageTo: $scope.generateDamageTo(newMove, $scope.moves)
        };
        $scope.moves.$add(moveObj).then(function(move) {
          var keys = $scope.moves.$getIndex();
          keys.forEach(function(key, i) {
            if(newMove != $scope.moves[key].name)
              $scope.addNewDamageToOf($scope.moves[key], newMove);
          });
          return move;
        });
      }
    };
  });
