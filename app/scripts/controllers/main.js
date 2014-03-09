'use strict';

angular.module('PvP')
  .controller('MainCtrl', function ($scope, $location, $filter, Games, Moves, $firebase, UserSession) {

    Moves.all().$then(function (moves) {
      console.log(moves.$getIndex());
      if (moves.$getIndex().length == 0) {
        Moves.add({
          name: 'volcano'
        });

        Moves.add({
          name: 'lightning'
        });

        Moves.add({
          name: 'water'
        });

        Moves.add({
          name: 'shield'
        });
      }
    });
    $scope.games = Games.all();

    $scope.add = function() {
      UserSession.signIn().then(function addGame(user) {
        $scope.games.$add({
          title: 'test',
          description: 'Best game ever',
          rounds: [],
          state: {
            name: 'waiting_join',
            detail: user.uid
          }
        }).then(function (ref) {
          var id = ref.name();
          Games.join(id, user).then(function () {
            $location.path('/game/' + id);
          });
        });
      });
    };
  });
