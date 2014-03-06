'user strict';

angular.module('PvP')
  .factory('Games', function ($rootScope, $q, Channel, firebaseUrl, $firebase) {
    var gamesRef = $firebase(new Firebase(firebaseUrl + 'games'));
    var dfdGames = $q.defer();

    gamesRef.$on('loaded', function () {
      dfdGames.resolve(gamesRef);
    });

    return {
      g: gamesRef,
      all: function () {
        return dfdGames.promise.then(function (games) {
          angular.extend(dfdGames.promise, games);
        });
      },

      get: function (id) {
        return dfdGames.promise.then(function (games) {
          angular.extend(dfdGames.promise, games[id]);
          console.log('Games get', dfdGames.promise);
          return games[id];
        });
      },

      join: function (id, user) {
        dfdGames.promise.then(function (games) {
          game = games[id];
          if (!game.players) game.players = {};
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
          games.$save(id);
        });
      }
    };
  });
