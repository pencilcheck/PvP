define([
  'angular',

  'controllers/about',
  'controllers/game',
  'controllers/leaderboard',
  'controllers/lobby',
  'controllers/main',

  'services/facebook',
  'services/game_states',
  'services/game',
  'services/games',
  'services/moves',
  'services/rematch',
  'services/user_session',
  'services/pvp_sync',

  'directives/arena',

  'filters/calendar',
  'filters/emptyOrInvited',

  'routes',

  'angular-sanitize',
  'angular-route',
  'angular-resource',
  'angular-facebook',
  'angular-cookies',
  'angular-bootstrap',
  'angular-deckgrid',
  'firebase',
  'firebase-simple-login',
], function (
  angular,

  AboutCtrl,
  GameCtrl,
  LeaderboardCtrl,
  LobbyCtrl,
  MainCtrl,

  FacebookBase,
  GameStates,
  Game,
  Games,
  Moves,
  Rematch,
  UserSession,
  pvpSync,

  arena,

  calendar,
  emptyOrInvited,

  routes
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
  ])

    .service('FacebookBase', FacebookBase)
    .service('GameStates', GameStates)
    .service('Game', Game)
    .service('Games', Games)
    .service('Moves', Moves)
    .service('Rematch', Rematch)
    .service('UserSession', UserSession)
    .service('pvpSync', pvpSync)

    .controller('AboutCtrl', AboutCtrl)
    .controller('GameCtrl', GameCtrl)
    .controller('LeaderboardCtrl', LeaderboardCtrl)
    .controller('LobbyCtrl', LobbyCtrl)
    .controller('MainCtrl', MainCtrl)

    .directive('arena', arena)

    .filter('calendar', calendar)
    .filter('emptyOrInvited', emptyOrInvited)

    .value('firebaseUrl', window.FirebaseUrl)

    .config(function(FacebookProvider) {
      FacebookProvider.init(window.FBAppId);
    })

    .config(routes)

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
});

