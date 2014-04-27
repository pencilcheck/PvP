define(['angular', 'controllers/game', 'controllers/lobby', 'controllers/login', 'controllers/main'], function (angular) {
  'use strict';

  return angular.module('PvP.controllers', [
    'PvP.controllers.game',
    'PvP.controllers.lobby',
    'PvP.controllers.login',
    'PvP.controllers.main'])
});
