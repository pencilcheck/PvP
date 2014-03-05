'use strict';

angular.module('PvP')
  .service('UserSession', function (Facebook, $timeout, $q) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    var deferred;

    var _completeAuth = function(user) {
      deferred.resolve(user);
      return user;
    };

    var _failAuth = function () {
      deferred.reject();
    }

    var completeSignIn = function(user) {
      localStorage.user = user;
      console.log('completeSignIn', user, localStorage.user);
      _completeAuth(user);
      return user;
    };

    var _resolveOrPrompt = function() {
      console.log('_resolveOrPrompt', localStorage.user);
      if(localStorage.user)
        _completeAuth(localStorage.user);
      else
        Facebook.openLogin().then(completeSignIn, _failAuth);
    };

    var signIn = function() {
      deferred = $q.defer();
      $timeout(_resolveOrPrompt, 10);
      return deferred.promise;
    };

    return {
      signIn: signIn,
      signedIn: !!localStorage.user,
      completeSignIn: completeSignIn,
      _resolveOrPrompt: _resolveOrPrompt,
      _completeAuth: _completeAuth
    }
  });
