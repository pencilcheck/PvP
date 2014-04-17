'use strict';

angular.module('PvP')
  .controller('MainCtrl', function ($scope, $location, $filter, Games, Moves, $firebase, UserSession) {

    Moves.all().$then(function (moves) {
      console.log(moves.$getIndex());
      if (moves.$getIndex().length == 0) {
        Moves.add({
          name: 'Fire',
          attackCss: 'fire-attack',
          moveCss: 'fire-attack',
          src: 'images/buttons/volcanobutton.png'
        });

        Moves.add({
          name: 'Lightning',
          attackCss: 'lightning-attack',
          moveCss: 'lightning-move',
          src: 'images/buttons/lightningbutton.png'
        });

        Moves.add({
          name: 'Water',
          attackCss: 'water-attack',
          moveCss: 'water-move',
          src: 'images/buttons/waterbutton.png'
        });

        Moves.add({
          name: 'Shield',
          attackCss: 'shield-attack',
          moveCss: 'shield-move',
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

    $scope.openGame = function (id) {
      Games.join(id).then(function () {
        $location.path('/game/' + id);
      }, function (reason) {
        alert(reason);
      });
    }
  });
