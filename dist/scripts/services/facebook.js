define(['angular'], function (angular) {
  'use strict';

  return angular.module('PvP.services.facebook', [])
    .service('FacebookBase', function ($rootScope, $q) {
      return {
        openLogin: function() {
          console.log('openLogin');
          var deferred = $q.defer();
          var gameRef = new Firebase('https://pvp.firebaseio.com');
          var auth = new FirebaseSimpleLogin(gameRef, function(error, user) {
            console.log('FirebaseSimpleLogin', error, user);
            if (error) {
              // an error occurred while attempting login
              console.error(error);
            } else if (user) {
              // user authenticated with Firebase
              console.log('User ID: ' + user.id + ', Provider: ' + user.provider);
              $rootScope.safeApply(function() {
                deferred.resolve(user);
                //$rootScope.$broadcast('loggedin');
              });
            } else {
              // user is logged out
            }
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
