define(function () {
  'use strict';

  function saveToStorage(name, value) {
    localStorage.setItem(name, JSON.stringify(value));
  }

  function getFromStorage(name) {
    return JSON.parse(localStorage.getItem(name));
  }

  return function (FacebookBase, $window, $rootScope, $timeout, $q, pvpSync) {
    var deferred,
        players = pvpSync('/players')

    function updatePlayer(user) {
      pvpSync('/players/' + user.uid).$promise.then(function (wrapper) {
        wrapper.$update({
          profile: user
        })
      });
    }

    var _completeAuth = function(user) {
      updatePlayer(user)
      return user;
    };

    var _failAuth = function (reason) {
      return $q.reject(reason);
    }

    var completeSignIn = function(user) {
      saveToStorage('user', user);
      $rootScope.safeApply(function () {
        $rootScope.signedIn = user;
      });
      _completeAuth(user);
      return user;
    };

    var _resolveOrPrompt = function(redirect) {
      if(getFromStorage('user'))
        return $q.when(completeSignIn(getFromStorage('user')));
      else
        return FacebookBase.openLogin(redirect).then(completeSignIn, _failAuth);
    };

    var signIn = function (prefer) {
      return _resolveOrPrompt(prefer);
    };

    var signOut = function () {
      return FacebookBase.logout().then(function () {
        saveToStorage('user', null);
        console.log('logOut');
        $rootScope.signedIn = null;
      });
    }

    FacebookBase.initialize().then(function (user) {
      completeSignIn(user);
    })

    $rootScope.logout = function () {
      signOut().then(function () {
        $window.location.href = '/';
      });
    };

    return {
      signIn: signIn,
      signOut: signOut,
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
  };
});
