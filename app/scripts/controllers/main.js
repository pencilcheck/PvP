'use strict';

angular.module('PvP')
  .controller('MainCtrl', function ($scope, Moves, $firebase, UserSession) {

    if (!Moves.all()) {
      Moves.m.$add({
        name: 'volcano'
      });

      Moves.m.$add({
        name: 'lightning'
      });

      Moves.m.$add({
        name: 'water'
      });

      Moves.m.$add({
        name: 'shield'
      });
    }

    $scope.games = $firebase(new Firebase('https://pvp.firebaseio.com/games'));

    $scope.add = function() {
      $scope.games.$add({
        title: 'test',
        description: 'Best game ever',
        rounds: []
      }).then(function (ref) {
        var id = ref.name();
        UserSession.signIn().then(function (user) {
          Games.join(id, user);
          $location.path('/game/' + id);
        });
      });
    };
  });
