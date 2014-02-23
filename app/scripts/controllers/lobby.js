'use strict';

angular.module('PvP')
  .controller('LobbyCtrl', function ($scope, $location, $firebase, firebaseUrl) {
    $scope.games = $firebase(new Firebase(firebaseUrl + 'games'));
    $scope.openGame = function (key) {
      $location.path('/game/' + key);
    }
  });
