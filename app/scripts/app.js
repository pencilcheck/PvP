'use strict';

angular.module('planetRusApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'firebase'
])
  .config(function($routeProvider, $locationProvider) {
    $locationProvider.html5Mode(true);
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
      .otherwise({
        redirectTo: '/'
      });
  });
