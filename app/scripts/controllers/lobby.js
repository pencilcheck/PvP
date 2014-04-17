'use strict';

angular.module('PvP')
  .controller('LobbyCtrl', function ($scope, $location, Games, UserSession) {
    $scope.games = Games.all();
    $scope.openGame = function (id) {
      Games.join(id).then(function () {
        $location.path('/game/' + id);
      }, function (reason) {
        alert(reason);
      });
    }
  });
