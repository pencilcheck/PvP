'user strict';

angular.module('PvP')
  .directive('tooltip', function () {
    return {
      restrict: 'AE',
      scope: {
        tooltip: '@'
      },
      link: function (scope, element, attributes) {
        scope.$watch('tooltip', function (newVal) {
          element.aToolTip({
            tipContent: newVal
          });
        });
      }
    }
  });
