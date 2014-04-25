'use strict';

angular.module('PvP')
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
          console.log('created game with id', game.raw().$id)
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
        $location.path('/game/' + id)
      })
    }
  });
