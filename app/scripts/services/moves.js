'user strict';

angular.module('PvP')
  .factory('Moves', function (firebaseUrl, $firebase, convertFirebase) {
    var moves = convertFirebase($firebase(new Firebase(firebaseUrl + 'moves')));

    return {
      all: function () {
        return moves;
      },

      add: function (move) {
        return moves.$add(move);
      },

      get: function (id) {
        return moves[id];
      }
    };
  });
