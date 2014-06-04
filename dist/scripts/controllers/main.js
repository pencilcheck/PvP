define(function () {
  'use strict';

  return function ($scope, $log, $window, $location, $filter, Games, Rematch, UserSession) {
    $scope.games = Games.all()
    Rematch.listenAll()

    $scope.facebookLogin = function() {
      UserSession.signIn(true).then(function () {
        $location.path('/');
      }, function () {
        alert('error');
      });
    }

    $scope.add = function() {
      UserSession.signIn().then(function (user) {
        Games.create({
          host: user.uid,
          title: 'test',
          description: 'Best game ever',
        }).then(function (game) {
          $window.location.href = '/#/game/' + game.raw().$id
        }, function (reason) {
          alert(reason)
        });
      })
    };

    $scope.openGame = function (id) {
      $window.location.href = '/#/game/' + id
    }
  };
});
