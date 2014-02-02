'use strict';

angular.module('planetRusApp')
  .service('UserSession', function UserSession(Facebook, $timeout) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    var deferred;
    return {
      signIn: function() {
        deferred = $q.defer();
        $timeout(_resolveOrPrompt, 10);
        return deferred.promise;
      },

      completeSignIn: function(user) {
        $cookies.user = user;
        _completeAuth(user);
      },

      _resolveOrPrompt: function() {
        if($cookies.user)
          _completeAuth();
        else
          Facebook.openLogin().then(completeSignIn);
      },

      _completeAuth: function(user) {
        deferred.resolve(user);
      }
    }
  });
