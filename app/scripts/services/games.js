'user strict';

angular.module('PvP')
  .factory('Games', function ($rootScope, $q, Channel, firebaseUrl, $firebase, convertFirebase) {
    var gamesRef = $firebase(new Firebase(firebaseUrl + 'games'));

    return {
      g: gamesRef,
      all: function () {
        return gamesRef;
      },

      get: function (id) {
        return id ? convertFirebase(gamesRef.$child(id)) : {};
      },

      create: function (options) {
        return gamesRef.$add(options)
      },

      join: function (id, user) {
        return convertFirebase(gamesRef.$child(id)).$then(function (game) {
          game.players = game.players || {};
          game.players[user.uid] = {
            uid: user.uid,
            selectedMoves: {},
            health: 10,
            name: user.displayName
          };
          game.$save('players');

          game.state = game.state || {};
          if (game.state && game.state.name == 'waiting_join' && game.state.detail && game.state.detail != user.uid) {
            game.state = {
              name: 'waiting_pick',
              detail: 'both'
            }
          }
          game.$save('state');
          return game;
        });
      }
    };
  });
