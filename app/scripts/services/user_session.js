'use strict';

function saveToStorage(name, value) {
  localStorage.setItem(name, JSON.stringify(value));
}

function getFromStorage(name) {
  return JSON.parse(localStorage.getItem(name));
}

angular.module('PvP')
  .service('UserSession', function (FacebookBase, $timeout, $q, pvpSync) {
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
