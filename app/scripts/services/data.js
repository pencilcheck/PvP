'user strict';

angular.module('PvP')
  .factory('convertFirebase', function ($q) {
    return function (ref) {
      var dfd = $q.defer();
      ref.$on('loaded', function () {
        dfd.resolve(ref);
      });
      ref.$then = function () {
        return dfd.promise.then.apply(ref, arguments);
      };
      return ref;
    };
  })
