'use strict';

angular.module('planetRusApp')
  .controller('LoginCtrl', function ($scope, $rootScope, $location) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
    $scope.loggedIn = false;

    $scope.openLogin = function(){
      var gameRef = new Firebase('https://pvp.firebaseio.com');
      $scope.auth = new FirebaseSimpleLogin(gameRef, function(error, user) {
        if (error) {
          // an error occurred while attempting login
          console.log(error);
        } else if (user) {
          // user authenticated with Firebase
          console.log('User ID: ' + user.id + ', Provider: ' + user.provider);
          $rootScope.user = user;
          $rootScope.$apply();
          $scope.greetUser();
        } else {
          // user is logged out
        }
      });
      $scope.auth.login('facebook', {
        rememberMe: true,
        scope: 'email,user_likes'
      });
    };

    $scope.greetUser = function(){
      $scope.user = $rootScope.user;
      $scope.loggedIn = true;
      $scope.greeting = "Hi " + $scope.user.displayName;
      $scope.userName = $scope.user.link;
      $scope.profilePic = "http://graph.facebook.com/" + $scope.user.link.split('https://www.facebook.com/')[1].trim() + "/picture";
      $scope.$apply();
    };

    $scope.loadGame = function(){
      console.log($location.path("lobby"));
    };

  });
