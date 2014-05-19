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
        redirect = false,
        players = pvpSync('/players')

    function updatePlayer(user) {
      var profile = {}
      profile[user.uid] = {
        profile: user
      }
      players.$update(profile)
    }

    var _completeAuth = function(user) {
      updatePlayer(user)
      if (deferred)
        deferred.resolve(user);
      return user;
    };

    var _failAuth = function (reason) {
      deferred.reject(reason);
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
        FacebookBase.openLogin(redirect).then(completeSignIn, _failAuth);
    };

    var signIn = function (prefer) {
      redirect = prefer;
      deferred = $q.defer();
      $timeout(_resolveOrPrompt, 10);
      return deferred.promise;
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
      $rootScope.signedIn = user;
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
