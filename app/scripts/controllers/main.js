define(['angular', 'services/index'], function (angular) {
  'use strict';

  return angular.module('PvP.controllers.main', [])
    .controller('MainCtrl', function ($scope, $location, $filter, Games, Rematch, UserSession) {
      $scope.games = Games.all()
      Rematch.listenAll()

      $scope.add = function() {
        UserSession.signIn().then(function (user) {
          Games.create({
            host: user.uid,
            title: 'test',
            description: 'Best game ever',
          }).then(function (game) {
            $location.path('/game/' + game.raw().$id);
          }, function (reason) {
            alert(reason)
          });
        })
      };

      $scope.openGame = function (id) {
        $location.path('/game/' + id)
      }
    });
});
