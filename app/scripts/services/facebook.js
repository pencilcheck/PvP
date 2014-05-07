define(['firebase', 'firebase-simple-login'], function (Firebase, FirebaseSimpleLogin) {
  'use strict';

  return function ($rootScope, $q, firebaseUrl) {
    var dfds = {
      loginDfd: $q.defer(),
      logoutDfd: $q.defer()
    };

    var gameRef = new Firebase(firebaseUrl);
    var auth = new FirebaseSimpleLogin(gameRef, function(error, user) {
      console.log('FirebaseSimpleLogin', error, user);
      $rootScope.safeApply(function() {
        if (error) {
          // an error occurred while attempting login
          dfds.loginDfd.reject(error);
        } else if (user) {
          // user authenticated with Firebase
          dfds.loginDfd.resolve(user);
        } else {
          // user is logged out
          dfds.logoutDfd.resolve('user logged out');
        }
      });
    });

    return {
      openLogin: function() {
        dfds.loginDfd = $q.defer();
        auth.login('facebook', {
          rememberMe: true,
          preferRedirect: false,
          scope: 'email,user_likes,basic_info,user_friends'
        });
        return dfds.loginDfd.promise;
      },

      logout: function () {
        dfds.logoutDfd = $q.defer();
        auth.logout();
        return dfds.logoutDfd.promise;
      }
    };
  };
});
