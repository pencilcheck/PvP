'use strict';

angular.module('PvP')
  .controller('MainCtrl', function ($scope, $location, $filter, Games, UserSession) {

    $scope.games = Games.all()

    $scope.add = function() {
      UserSession.signIn().then(function (user) {
        Games.create({
          host: user,
          title: 'test',
          description: 'Best game ever',
        }).then(function (game) {
          // Don't redeem to invite
          $location.path('/game/' + game.raw().$id);
          //game.$redeem(user).then(function () {
          //})
        }, function (reason) {
          alert(reason)
        });
      })
    };

    $scope.openGame = function (id) {
      UserSession.signIn().then(function (user) {
        Games.get(id).then(function (game) {
          game.$redeem(user).then(function (game) {
            $location.path('/game/' + game.raw().$id);
          }, function (reason) {
            alert(reason);
          });
        })
      })
    }
  });
