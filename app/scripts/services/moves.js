'user strict';

angular.module('PvP')
  .factory('Moves', function ($rootScope, $q, firebaseUrl, $firebase) {
    var moves = $firebase(new Firebase(firebaseUrl + 'moves'));

    return {
      m: moves,
      all: function () {
        return moves;
      },

      get: function (id) {
        return moves[id];
      }
    };
  });
