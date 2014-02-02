'use strict';

angular.module('planetRusApp')
  .service('UserSession', function UserSession(Facebook, $timeout, $cookies, $q) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    var deferred;

    var _completeAuth = function(user) {
      deferred.resolve(user);
      return user;
    };

    var completeSignIn = function(user) {
      $cookies.user = user;
      _completeAuth(user);
      return user;
    };

    var _resolveOrPrompt = function() {
      if($cookies.user)
        _completeAuth();
      else
        Facebook.openLogin().then(completeSignIn);
    };

    var signIn = function() {
      deferred = $q.defer();
      $timeout(_resolveOrPrompt, 10);
      return deferred.promise;
    };

    return {
      signIn: signIn,
      completeSignIn: completeSignIn,
      _resolveOrPrompt: _resolveOrPrompt,
      _completeAuth: _completeAuth
    }
  });
