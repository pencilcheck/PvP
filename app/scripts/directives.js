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
          var logo = new ImageSurface({
              content: 'images/planets/player1.png'
          });

          var logoModifier = new StateModifier({
              size: [200, 200],
              origin: [0.5, 0.5]
          });

          var input = new InputSurface({
              size: [200, 200],
              name: 'inputSurface',
              placeholder: 'Type text here',
              value: 'images/planets/player1.png',
              type: 'text'
          });

          var dragModifier = new Draggable();

          mainContext.add(logoModifier).add(dragModifier).add(logo);

          mainContext.add(new Modifier({origin: [.8, .5]})).add(input);

          logo.on('dragstart', function(data) {
              window.console.log('dragstart', data);
          });

          logo.on('dragmove', function(data) {
              window.console.log('dragmove', data);
          });

          logo.on('dragend', function(data) {
              window.console.log('dragend', data);
              window.console.log('sizing', logoModifier.getSize());

              var easeTransition = { duration: 500, curve: Easing.inOutCubic };
              dragModifier.setRelativePosition([data.offsetX - logoModifier.getSize()[0]/2, data.offsetY - logoModifier.getSize()[1]/2, 0], easeTransition);
          });
        }
      }
    });
});
