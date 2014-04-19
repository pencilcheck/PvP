'use strict';

function saveToStorage(name, value) {
  localStorage.setItem(name, JSON.stringify(value));
}

function getFromStorage(name) {
  return JSON.parse(localStorage.getItem(name));
}

angular.module('PvP')
  .service('UserSession', function (FacebookBase, $timeout, $q) {
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
      saveToStorage('user', user);
      _completeAuth(user);
      return user;
    };

    var _resolveOrPrompt = function() {
      if(getFromStorage('user'))
        _completeAuth(getFromStorage('user'));
      else
        FacebookBase.openLogin().then(completeSignIn, _failAuth);
    };

    var signIn = function() {
      deferred = $q.defer();
      $timeout(_resolveOrPrompt, 10);
      return deferred.promise;
    };

    return {
      signIn: signIn,
      signedIn: function () {
        return !!getFromStorage('user');
      },
      currentUser: function () {
        return getFromStorage('user');
      },
      completeSignIn: completeSignIn,
      _resolveOrPrompt: _resolveOrPrompt,
      _completeAuth: _completeAuth
    }
  });
