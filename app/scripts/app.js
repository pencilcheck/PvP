'use strict';

angular.module('PvP', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'firebase'
])
  .run(function ($rootScope, $location, UserSession) {
    $rootScope.$on('$locationChangeStart', function (event, currLocation, prevLocation) {
      console.log(currLocation, prevLocation);
      if (!UserSession.signedIn && currLocation.indexOf('login') < 0) {
        event.preventDefault();
        UserSession.signIn().then(function () {
          $location.path(currLocation);
        }, function () {
          $location.path('/login');
        });
      }
    });
  }).run(function($rootScope) {
    $rootScope.safeApply = function(fn) {
      var phase = this.$root.$$phase;
      if(phase == '$apply' || phase == '$digest') {
        if(fn && (typeof(fn) === 'function')) {
          fn();
        }
      } else {
        this.$apply(fn);
      }
    };
  })
  .value('firebaseUrl', 'https://pvp.firebaseio.com/')
  .config(function($routeProvider, $locationProvider) {
    $routeProvider
      .when('/', {
        templateUrl: '/views/main.html',
        controller: 'MainCtrl'
      })
      .when('/login', {
        templateUrl: '/views/login.html',
        controller: 'LoginCtrl'
      })
      .when('/lobby', {
        templateUrl: '/views/lobby.html',
        controller: 'LobbyCtrl'
      })
      .when('/game/:gameId', {
        templateUrl: '/views/game.html',
        controller: 'GameCtrl',
        resolve: {
          gameConfig: function (Game, $routeParams) {
            return Game($routeParams.gameId, localStorage.user.uid);
          }
        }
      })
      .when('/moves', {
        templateUrl: 'views/moves.html',
        controller: 'MovesCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
