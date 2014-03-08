'user strict';

angular.module('PvP')
  .factory('Games', function ($rootScope, $q, Channel, firebaseUrl, $firebase) {
    var gamesRef = $firebase(new Firebase(firebaseUrl + 'games'));

    return {
      g: gamesRef,
      all: function () {
        return gamesRef;
      },

      get: function (id) {
        return id ? gamesRef.$child(id) : {};
      },

      join: function (id, user) {
        var game = gamesRef.$child(id);
        if (!game.players)
          game.players = {};
        game.players[user.uid] = {
          uid: user.uid,
          selectedMoves: {},
          health: 10,
          name: user.firstname
        };

        if (!game.state) {
          game.state = {
            name: 'waiting_join',
            detail: ''
          }
        } else if (game.state.name == 'waiting_join' && game.state.detail != user.uid) {
          game.state = {
            name: 'waiting_pick',
            detail: 'both'
          }
        }

        return gamesRef.$save(id);
      }
    };
  });
