define(['angular'], function (angular) {
  'use strict';

  return angular.module('PvP.services.facebook', [])
    .service('FacebookBase', function ($rootScope, $q) {
      return {
        openLogin: function() {
          var deferred = $q.defer();
          var gameRef = new Firebase('https://pvp.firebaseio.com');
          var auth = new FirebaseSimpleLogin(gameRef, function(error, user) {
            console.log('FirebaseSimpleLogin', error, user);
            $rootScope.safeApply(function() {
              if (error) {
                // an error occurred while attempting login
                deferred.reject(error);
              } else if (user) {
                // user authenticated with Firebase
                deferred.resolve(user);
              } else {
                // user is logged out
                deferred.reject('user logged out');
              }
            });
          });

          auth.login('facebook', {
            rememberMe: true,
            preferRedirect: false,
            scope: 'email,user_likes,basic_info,user_friends'
          });

          return deferred.promise;
        }
      };
    });
});
