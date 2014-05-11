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
      if (players[user.uid]) {
        players[user.uid].profile = user
        players.$save()
      } else {
        players.$child(user.uid).$child('profile').$set(user)
      }
    }

    var _completeAuth = function(user) {
      updatePlayer(user)
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
        FacebookBase.openLogin().then(completeSignIn, _failAuth);
    };

    var signIn = function () {
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
