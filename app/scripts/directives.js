'user strict';

angular.module('PvP')
  .directive('tooltip', function () {
    return {
      restrict: 'AE',
      scope: {
        tooltip: '@'
      },
      link: function (scope, element, attributes) {
      }
    }
  });
