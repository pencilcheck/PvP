'user strict';

angular.module('PvP')
  .factory('Channel', function ($q, $http) {

    return new (function () {
      var tries = 0;

      this.connect = function (name) {
        var defer = $q.defer();

        $http.get('/connectChannel', { name: name }).success(function (token) {
          var channel = goog.appengine.Channel(token);
          var socket = channel.open();
          defer.resolve(socket);
        }).error(function() {
          defer.reject();
        });

        return defer.promise;
      };

      this.setup = function (name, handlers) {
        this.connect('games').then(function (socket) {
          for (var handler in handlers) {
            socket[handler] = handlers[handler];
          }
        }, function () {
          if (tries < 3) {
            this.setup(name, handlers);
            tries += 1;
          } else {
            tries = 0;
            alert('Cannot connect to server!');
          }
        });
      }
    })();
  });
