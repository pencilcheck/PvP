define(function (require) {
  'user strict';

  // This way famous is loaded, because we didn't specify dependencies
  var angular = require('angular')

  return angular.module('PvP.directives', [])
    .directive('arena', function () {
      return {
        restrict: 'AE',
        link: function(scope, element) {
          // import dependencies
          var Engine = require('famous/core/Engine');
          var ImageSurface = require('famous/surfaces/ImageSurface');
          var StateModifier = require('famous/modifiers/StateModifier');
          var Draggable = require('famous/modifiers/Draggable');
          var Easing = require('famous/transitions/Easing');
          var Modifier = require('famous/core/Modifier');
          var InputSurface = require("famous/surfaces/InputSurface");

          // create the main context
          var mainContext = Engine.createContext(element[0]);

          // your app here
          var player1 = new ImageSurface({
              content: 'images/planets/player1.png'
          });

          var player1Modifier = new StateModifier({
              size: [300, 300],
              origin: [0.2, 0.7]
          });

          var smackTalk1 = new InputSurface({
              size: [200, 40],
              name: 'smackTalk1',
              placeholder: 'Smack Talk',
              value: '',
              type: 'text'
          });

          mainContext.add(player1Modifier).add(player1);

          mainContext.add(new Modifier({origin: [.8, .5]})).add(smackTalk1);
        }
      }
    });
});
