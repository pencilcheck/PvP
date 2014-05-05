define([
  'angular',
  'angular-sanitize',
  'angular-route',
  'angular-resource',
  'angular-facebook',
  'angular-cookies',
  'angular-bootstrap',
  'angular-deckgrid',
  'firebase',
  'firebase-simple-login',
  'controllers/index',
  'services/index',
  'directives',
  'filters'
], function (
  angular
) {
  'use strict';

  return angular.module('PvP', [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngRoute',
    'ui.bootstrap',
    'facebook',
    'akoenig.deckgrid',
    'wu.masonry',
    'PvP.controllers',
    'PvP.services',
    'PvP.directives',
    'PvP.filters'
  ])

    .config(function(FacebookProvider) {
      FacebookProvider.init('1440880659476523');
    })

    .run(function ($rootScope, $location) {
      $rootScope.$on('$routeChangeError', function (e, currRoute, prevRoute) {
        console.log('$routeChangeError', currRoute, prevRoute);
        if (currRoute.loadedTemplateUrl == '/views/game.html') {
          $rootScope.flashes = [{type: 'warning', message: "Something went wrong! Most likely you don't have the invitation to the game. Start a new game and invite your friend!"}];
        }
        $location.path('/')
      });
    })

    .run(function($rootScope) {
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
    .config(function($routeProvider, $locationProvider) {
      //$locationProvider.html5Mode(true); // TODO: later
      $routeProvider
        .when('/', {
          templateUrl: '/views/main.html',
          controller: 'MainCtrl'
        })
        .when('/lobby', {
          templateUrl: '/views/lobby.html',
          controller: 'LobbyCtrl'
        })
        .when('/game/:gameId', {
          templateUrl: '/views/game.html',
          controller: 'GameCtrl',
          resolve: {
            game: function ($q, $route, Games, UserSession) {
              return Games.get($route.current.params.gameId).then(function (game) {
                return UserSession.signIn().then(function (user) {
                  return game.$redeem(UserSession.currentUser())
                })
              })
            },
            rematchRequests: function (pvpSync) {
              return pvpSync('/rematchRequests').$promise
            }
          }
        })
        .otherwise({
          redirectTo: '/'
        });
    });
});

