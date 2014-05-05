define(['angular', 'services/index'], function (angular) {
  'use strict';

  return angular.module('PvP.controllers.login', [])
    .controller('LoginCtrl', function ($scope, $rootScope, $location, UserSession) {
      $scope.loggedIn = false;

      $scope.openLogin = function() {
        UserSession.signIn().then($scope.greetUser, function (reason) {
          console.log('login openLogin')
        });
      }

      $scope.greetUser = function(user) {
        $scope.user = user;
        $scope.loggedIn = true;
        $scope.greeting = "Hi " + $scope.user.displayName;
        $scope.userName = $scope.user.link;
        $scope.profilePic = "http://graph.facebook.com/" + $scope.user.link.split('https://www.facebook.com/')[1].trim() + "/picture";
      };

      $scope.loadGame = function(){
        console.log($location.path("lobby"));
      };

    });
});
