'use strict';

angular.module('PvP')
  .controller('MainCtrl', function ($scope, $location, Games, Moves, $firebase, UserSession) {

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
      function addGame(user) {
        console.log('addGame');
        $scope.games.$add({
          title: 'test',
          description: 'Best game ever',
          rounds: []
        }).then(function (ref) {
          var id = ref.name();
          Games.join(id, user);
          $location.path('/game/' + id);
        });
      }

      UserSession.signIn().then(addGame, function () {
        console.log('failed?');
      });
    };
  });
