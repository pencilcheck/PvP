define(function () {
  'user strict';

  return function($routeProvider, $locationProvider) {
    //$locationProvider.html5Mode(true); // TODO: later
    $routeProvider
      .when('/', {
        templateUrl: '/views/main.html',
        controller: 'MainCtrl'
      })
      .when('/about', {
        templateUrl: '/views/about.html',
        controller: 'AboutCtrl'
      })
      .when('/leaderboard', {
        templateUrl: '/views/leaderboard.html',
        controller: 'LeaderboardCtrl'
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
  }
});
