'use strict';

angular.module('PvP')
  .controller('MainCtrl', function ($scope, $location, $filter, Games, Moves, $firebase, UserSession) {

    Moves.all().$then(function (moves) {
      console.log(moves.$getIndex());
      if (moves.$getIndex().length == 0) {
        Moves.add({
          name: 'volcano',
          src: 'images/buttons/volcanobutton.png'
        });

        Moves.add({
          name: 'lightning',
          src: 'images/buttons/lightningbutton.png'
        });

        Moves.add({
          name: 'water',
          src: 'images/buttons/waterbutton.png'
        });

        Moves.add({
          name: 'shield',
          src: 'images/buttons/magneticfieldbutton.png'
        });
      }
    });
    $scope.games = Games.all();

    $scope.add = function() {
      Games.create({
        title: 'test',
        description: 'Best game ever',
      }).then(function (id) {
        $location.path('/game/' + id);
      });
    };
  });
