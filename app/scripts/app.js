'use strict';

angular.module('planetRusApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'firebase'
])
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
        controller: 'GameCtrl'
      })
      .when('/moves', {
        templateUrl: 'views/moves.html',
        controller: 'MovesCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
