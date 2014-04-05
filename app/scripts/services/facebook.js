'use strict';

angular.module('PvP')
  .service('Facebook', function Facebook($rootScope, $q) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    return {
      openLogin: function() {
        console.log('openLogin');
        var deferred = $q.defer();
        var gameRef = new Firebase('https://pvp.firebaseio.com');
        var auth = new FirebaseSimpleLogin(gameRef, function(error, user) {
          console.log('FirebaseSimpleLogin', error, user);
          if (error) {
            // an error occurred while attempting login
            console.log(error);
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
          preferRedirect: true,
          scope: 'email,user_likes'
        });

        return deferred.promise;
      }
    };
  });
