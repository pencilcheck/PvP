'use strict';

angular.module('PvP')
  .controller('MovesCtrl', function ($scope, $firebase, firebaseUrl, UserSession, Moves) {

    $scope.moves = Moves.all();

    $scope.clear = function() {
      $scope.moves.$set({});
    }

    $scope.generateDamageTo = function(moveName, moves) {
      var result = {};
      var keys = moves.$getIndex();
      keys.forEach(function(key, i) {
        result[key] = 0;
      });
      // To itself
      result[moveName] = 0;

      return result;
    };

    $scope.addNewDamageToOf = function(moves, key, newMove) {
      moves
        .$child(key)
          .$child('damageTo')
            .$child(newMove).$set(0);
    };

    $scope.duplicate = function(newMove, moves) {
      var keys = moves.$getIndex();
      keys.forEach(function(key, i) {
        if(newMove == key)
          return true;
      });
      return false;
    };

    $scope.addOne = function(newMove) {
      if(!$scope.duplicate(newMove, $scope.moves)) {
        var moveFirebase = $scope.moves.$child(newMove);

        var moveObj = {
          name: newMove,
          damageTo: $scope.generateDamageTo(newMove, $scope.moves)
        };

        moveFirebase.$set(moveObj).then(function(move) {
          var keys = $scope.moves.$getIndex();
          keys.forEach(function(key, i) {
            if(newMove != key)
              $scope.addNewDamageToOf($scope.moves, key, newMove);
          });
          return move;
        });
      }
    };
  });
