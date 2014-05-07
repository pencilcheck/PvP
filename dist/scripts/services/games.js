define(['moment'], function (moment) {
  'user strict';

  return function ($rootScope, $q, pvpSync, Game) {
    var syncHandle = pvpSync('/games')

    return {
      all: function () {
        return syncHandle
      },

      get: function (id) {
        return syncHandle.$child(id).$promise.then(function (child) {
          return new Game(child)
        })
      },

      construct: function (raw) {
        return new Game(raw)
      },

      create: function (options) {
        options = _.extend(options, {
          createdAt: moment().toISOString(),
          rounds: [],
          state: 0
        })

        return syncHandle.$push(options).then(function (game) {
          return new Game(game)
        })
      }
    };
  };
});
