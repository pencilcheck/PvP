'use strict';

angular.module('planetRusApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'firebase'
])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/login', {
        templateUrl: 'views/login.html',
        controller: 'LoginCtrl'
      })
      .when('/lobby', {
        templateUrl: 'views/lobby.html',
        controller: 'LobbyCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
