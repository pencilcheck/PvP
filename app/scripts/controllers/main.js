'use strict';

angular.module('planetRusApp')
  .controller('MainCtrl', function ($scope, $firebase) {
    $scope.games = $firebase(new Firebase('https://pvp.firebaseio.com/games'))
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];

    $scope.add = function() {
      $scope.games.$add({title: 'test'});
      $scope.games.$add({title: 'test2'});
      $scope.games.$add({title: 'test3'});
    }
  });
