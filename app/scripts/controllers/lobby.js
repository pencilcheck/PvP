'use strict';

angular.module('PvP')
  .controller('LobbyCtrl', function ($scope, $location, Games, UserSession) {
    $scope.games = Games.all();
    $scope.openGame = function (id) {
      UserSession.signIn().then(function (user) {
        Games.join(id, user);
        $location.path('/game/' + id);
      });
    }
  });
