'user strict';

angular.module('PvP')
  .factory('Games', function ($rootScope, $q, Channel, firebaseUrl, $firebase, UserSession, convertFirebase) {
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
        var self = this
        console.log('creating the game')
        return UserSession.signIn().then(function (user) {
          options = _.extend(options, {
            createdAt: moment(),
            rounds: [],
            state: {
              name: 'waiting_join',
              detail: user.uid
            }
          })
          console.log('creating game with options', options)
          return gamesRef.$add(options).then(function (ref) {
            return self.join(ref.name())
          })
        })
      },

      join: function (id) {
        return UserSession.signIn().then(function (user) {
          return convertFirebase(gamesRef.$child(id)).$then(function (game) {
            game.players = game.players || {};

            if (Object.keys(game.players).length >= 2) {
              return $q.reject('Room is full');
            }

            game.players[user.uid] = {
              uid: user.uid,
              selectedMoves: {},
              health: 10,
              name: user.displayName
            };

            game.state = game.state || {};
            if (game.state && game.state.name == 'waiting_join' && game.state.detail && game.state.detail != user.uid) {
              game.state = {
                name: 'waiting_pick',
                detail: 'both'
              }
            }
            return game.$save().then(function () {
              return id
            });
          });
        })
      }
    };
  });
