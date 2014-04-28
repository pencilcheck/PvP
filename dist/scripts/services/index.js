define(['angular', 'services/facebook', 'services/game', 'services/games', 'services/moves', 'services/rematch', 'services/user_session', 'services/utils'], function (angular) {
  'use strict';

  return angular.module('PvP.services', [
    'PvP.services.facebook',
    'PvP.services.game',
    'PvP.services.games',
    'PvP.services.moves',
    'PvP.services.rematch',
    'PvP.services.userSession',
    'PvP.services.utils']);
});
