define(function (require) {
  'user strict'

  // This way famous is loaded, because we didn't specify dependencies
  var angular = require('angular')

  return angular.module('PvP.directives', [])
    .directive('arena', function ($timeout) {
      return {
        restrict: 'AE',
        link: function(scope, element) {
          $timeout(function () {
            // import dependencies
            var Engine = require('famous/core/Engine')
            var Surface = require('famous/core/Surface')
            var ImageSurface = require('famous/surfaces/ImageSurface')
            var StateModifier = require('famous/modifiers/StateModifier')
            var Draggable = require('famous/modifiers/Draggable')
            var Easing = require('famous/transitions/Easing')
            var Modifier = require('famous/core/Modifier')
            var InputSurface = require("famous/surfaces/InputSurface")
            var SequentialLayout = require("famous/views/SequentialLayout")
            var Vector = require("famous/math/Vector")
            var Utility = require("famous/utilities/Utility")
            var PhysicsEngine = require("famous/physics/PhysicsEngine")
            var Particle = require("famous/physics/bodies/Particle")
            var Spring = require("famous/physics/forces/Spring")
            var RenderNode = require('famous/core/RenderNode')
            var Transform = require('famous/core/Transform')
            var Transitionable = require("famous/transitions/Transitionable");
            var Timer = require('famous/utilities/Timer');
            var GridLayout = require("famous/views/GridLayout");
            var SequentialLayout = require("famous/views/SequentialLayout");
            var Scrollview = require("famous/views/Scrollview");
            var ContainerSurface = require("famous/surfaces/ContainerSurface");
            var RenderController = require("famous/views/RenderController");

            // create the main context
            var mainContext = Engine.createContext(element[0])
            var PE = new PhysicsEngine()

            // elements
            var dialogModifier = new StateModifier({
              origin: [.5, 0]
            })
            var dialog = new Surface({
              size: [undefined, 200],
              classes: ['red-bg'],
              content: 'What should we do?',
              properties: {
                lineHeight: "200px",
                textAlign: "center",
                fontSize: "xx-large",
              }
            })



            var actionLogModifier = new StateModifier({
              transform: Transform.inFront,
              origin: [.5, 1]
            })
            var actionLogRenderController = new RenderController()
            var actionLogContainer = new ContainerSurface({
              size: [undefined, 100],
              properties: {
                  overflow: 'hidden'
              },
              classes: ['console-log-famous'],
            })

            var actionLogEmptySurface = new Surface({
              size: [undefined, 100],
            })
            var actionLogTriggerSurface = new Surface({
              size: [undefined, 100],
              properties: {
                lineHeight: "100px",
                textAlign: "center"
              },
              content: 'CLICK ME',
            })
            actionLogRenderController.show(actionLogTriggerSurface)

            var actionLog = new Scrollview()
            var logs = []
            actionLog.sequenceFrom(logs)

            // Test data
            /*
            _.range(100).forEach(function (i) {
              var temp = new Surface({
                properties: {
                  backgroundColor: "hsl(" + (i * 360 / 40) + ", 100%, 50%)",
                  lineHeight: "50px",
                  textAlign: "center"
                },
                size: [undefined, 50],
                content: 'log ' + i
              })
              temp.pipe(actionLog)
              logs.push(temp)
            })
            */

            actionLogContainer.add(actionLog)

            actionLogTriggerSurface.on('click', function () {
              actionLogRenderController.show(actionLogContainer)
            })
            actionLogContainer.on('click', function () {
              actionLogRenderController.show(actionLogTriggerSurface)
            })

            scope.$watch('rounds', function (newVal) {
              logs.length = 0
              newVal.forEach(function (round, i) {
                var temp = new Surface({
                  properties: {
                    backgroundColor: "hsl(" + (i * 360 / 40) + ", 100%, 50%)",
                    lineHeight: "200px",
                    textAlign: "center"
                  },
                  size: [200, 50],
                  content: round.log
                })
                temp.pipe(actionLog);
                logs.push(temp)
              })
              console.log(logs)
            })



            var explosionModifier = new StateModifier({
              origin: [.5, .5]
            })
            var explosion = new Surface({
              size: [500, 500],
              classes: ['explosion']
            })



            var planetSurface = new ImageSurface({
              size: [300, 300],
              content: 'images/planets/player1.png',
            })

            var bubbleSurface = new Surface({
              classes: ['bubble-famous'],
              properties: {
                lineHeight: "50px",
                textAlign: "center",
                fontSize: '22px',
                color: '#ACD6E5',
              },
              content: 'test test test'
            })

            var smackTalkSurface = new InputSurface({
              size: [undefined, 40],
              name: 'smackTalkSurface',
              placeholder: 'Smack Talk',
              value: '',
              type: 'text'
            })

            var attackButtonsLayout = new SequentialLayout({
                direction: Utility.Direction.X,
                size: [200, 60]
            })

            function setupAttackButtons() {
              var buttons = []
              attackButtonsLayout.sequenceFrom(buttons);

              var attackInfos = [
                {
                  name: 'Fire',
                  cssClasses: ['fire-attack']
                },
                {
                  name: 'Lightning',
                  cssClasses: ['lightning-attack']
                },
                {
                  name: 'Water',
                  cssClasses: ['water-attack']
                },
                {
                  name: 'Shield',
                  cssClasses: ['shield-attack']
                }
              ]

              attackInfos.forEach(function (info, offset) {
                var attackButton = new Surface({
                  size: [60, 60],
                  classes: info.cssClasses
               
                  //properties: {
                    //backgroundColor: "hsl(" + (i * 360 / 10) + ", 100%, 50%)",
                    //lineHeight: window.innerHeight/10 + "px",
                    //textAlign: "center"
                  //}
                })

                // spring effect
                var particle = new Particle({
                  position: [0, 0, 0]
                })

                var spring = new Spring({
                  anchor: [0, 0, 0],
                  period: 400, 
                  dampingRatio: 0.2,
                })

                PE.attach(spring, particle)
                PE.addBody(particle)

                attackButton.on("click", function (e) {
                  particle.applyForce(new Vector(0, 0, -0.005 * 50))
                });

                var renderNode = new RenderNode()
                renderNode.add(particle).add(attackButton)

                buttons.push(renderNode)
              })
            }
            setupAttackButtons()

            var chainOfHeartsModifier = new StateModifier({
              //size: [200, 200],
              //origin: [.5, .5],
            })
            var heartIndex = 0
            var chainOfHearts = new SequentialLayout();
            chainOfHearts.setOutputFunction(function (input, offset, index) {
              var ringTransform = Transform.translate(-25 + 200, -25 + 200, 0)

              ringTransform = Transform.multiply(Transform.aboutOrigin([200, 0, 200], Transform.rotateY(360 * index / scope.health * Math.PI / 180 + heartIndex)), ringTransform)
              ringTransform = Transform.multiply(Transform.rotateX(20 * Math.PI / 180), ringTransform)
              ringTransform = Transform.multiply(Transform.rotateZ(20 * Math.PI / 180), ringTransform)


              //ringTransform = Transform.multiply(Transform.rotateX(-60 * Math.PI / 180), ringTransform)
              //ringTransform = Transform.multiply(Transform.rotateZ(-360 * index / scope.health * Math.PI / 180), ringTransform)
              //ringTransform = Transform.multiply(Transform.aboutOrigin([150, 150, 0], Transform.rotateZ(360 * index / scope.health * Math.PI / 180)), ringTransform)
              //ringTransform = Transform.multiply(Transform.rotateX(60 * Math.PI / 180), ringTransform)

              return {
                transform: ringTransform,
                target: input.render()
              };
            })

            function rotateHealthRing() {
              chainOfHearts.render()
              heartIndex += 0.01
            }

            function setupChainOfHearts() {
              var hearts = []
              chainOfHearts.sequenceFrom(hearts)

              _.range(scope.health).forEach(function (index) {
                var heart = new ImageSurface({
                  size: [50, 50],
                  content: 'images/misc/life.png',
                })
                hearts.push(heart)
              })
            }
            setupChainOfHearts()

            var player1RotateAngle = 0
            var player1RotateDirection = 1
            var planetModifier = new StateModifier({
              origin: [.5, .5],
            })

            function wigglePlanets() {
              planetModifier.setTransform(Transform.rotateZ(player1RotateAngle))
              if (player1RotateDirection) {
                player1RotateAngle += 1 * Math.PI / 180
              } else {
                player1RotateAngle -= 1 * Math.PI / 180
              }
              if (player1RotateAngle >= Math.PI / 180) {
                player1RotateDirection = 0
              } else if (player1RotateAngle <= -Math.PI / 180) {
                player1RotateDirection = 1
              }
            }

            function resetPlanets() {
              planetModifier.setTransform(Transform.rotateZ(0))
            }
            

            var bubbleNodeModifier = new StateModifier({
              size: [350, 150],
              transform: Transform.translate(-50, -300, 0)
            })

            var bubbleNode = new RenderNode()
            bubbleNode.add(new StateModifier({origin: [.5, .5]})).add(bubbleSurface)
            bubbleNode.add(new StateModifier({origin: [.5, .1]})).add(smackTalkSurface)
            bubbleNode.add(new StateModifier({origin: [.5, .8]})).add(attackButtonsLayout)

            var planetNodeModifier = new StateModifier({
              size: [300, 300]
            })

            var planetNode = new RenderNode()
            planetNode.add(planetModifier).add(planetSurface)
            planetNode.add(chainOfHeartsModifier).add(chainOfHearts)

            var playerNode = mainContext.add(new StateModifier({origin: [.2, .8]}))
            playerNode.add(planetNodeModifier).add(planetNode)
            playerNode.add(bubbleNodeModifier).add(bubbleNode)



            var opponentPlanetSurface = new ImageSurface({
              size: [300, 300],
              content: 'images/planets/player2.png',
            })

            var opponentBubbleSurface = new Surface({
              classes: ['bubble2-famous'],
              properties: {
                lineHeight: "225px",
                textAlign: "center",
                fontSize: '22px',
                color: '#ACD6E5',
              },
              content: 'test test test'
            })

            var opponentChosenAttack = new Surface({
                size: [60, 60],
                classes: ['fire-attack']
            })

            var opponentChainOfHeartsModifier = new StateModifier({
              size: [250, 100],
              origin: [.3, .8]
            })

            var opponentChainOfHearts = new GridLayout({
                dimensions: [5, 2]
            });

            function setupOpponentChainOfHearts() {
              var hearts2 = []
              opponentChainOfHearts.sequenceFrom(hearts2)

              _.range(scope.opponentHealth).forEach(function (index) {
                var heart = new ImageSurface({
                  size: [50, 50],
                  content: 'images/misc/life.png',
                })
                hearts2.push(heart)
              })
            }
            setupOpponentChainOfHearts()

            var opponentBubbleNodeModifier = new StateModifier({
              size: [350, 150],
              transform: Transform.translate(50, 300, 0)
            })

            var opponentBubbleNode = new RenderNode()
            opponentBubbleNode.add(new StateModifier({origin: [.5, .5]})).add(opponentBubbleSurface)
            opponentBubbleNode.add(new StateModifier({origin: [.5, .2]})).add(opponentChosenAttack)

            var opponentPlanetNodeModifier = new StateModifier({
              size: [300, 300]
            })

            var opponentPlanetNode = new RenderNode()
            opponentPlanetNode.add(opponentPlanetSurface)
            opponentPlanetNode.add(opponentChainOfHeartsModifier).add(opponentChainOfHearts)

            var opponentNode = mainContext.add(new Modifier({origin: [.8, .2]}))
            opponentNode.add(opponentPlanetNodeModifier).add(opponentPlanetNode)
            opponentNode.add(opponentBubbleNodeModifier).add(opponentBubbleNode)



            // animations and events
            planetSurface.on('mouseover', function (e) {
              Engine.on('prerender', rotateHealthRing)
              Engine.on('prerender', wigglePlanets)
            })

            planetSurface.on('mouseout', function (e) {
              Timer.clear(wigglePlanets)
              Timer.clear(rotateHealthRing)
              resetPlanets()
            })



            // angular binding
            scope.$watch('notSeenAnimation', function funciton () {
            })

            scope.$watch('attackCommitted()', function funciton () {
            })



            // Do the cube demo
            /*
            var front = new Surface({
              size: [200, 200],
              content: 1,
              properties: {
                backgroundColor: "hsl(0, 100%, 50%)",
                 lineHeight: 200 + "px",
                 textAlign: "center"
              }
            })
            var back = new Surface({
              size: [200, 200],
              content: 6,
              properties: {
                backgroundColor: "hsl(60, 100%, 50%)",
                 lineHeight: 200 + "px",
                 textAlign: "center"
              }
            })
            var right = new Surface({
              size: [200, 200],
              content: 2,
              properties: {
                backgroundColor: "hsl(120, 100%, 50%)",
                 lineHeight: 200 + "px",
                 textAlign: "center"
              }
            })
            var left = new Surface({
              size: [200, 200],
              content: 3,
              properties: {
                backgroundColor: "hsl(180, 100%, 50%)",
                 lineHeight: 200 + "px",
                 textAlign: "center"
              }
            })
            var top = new Surface({
              size: [200, 200],
              content: 4,
              properties: {
                backgroundColor: "hsl(240, 100%, 50%)",
                 lineHeight: 200 + "px",
                 textAlign: "center"
              }
            })
            var bottom = new Surface({
              size: [200, 200],
              content: 5,
              properties: {
                backgroundColor: "hsl(300, 100%, 50%)",
                 lineHeight: 200 + "px",
                 textAlign: "center"
              }
            })
            var cube = mainContext.add(new StateModifier({origin: [.5, .5]}))
            cube.add(new StateModifier({
              transform: Transform.translate(0, 0, 100)
            })).add(front)
            cube.add(new StateModifier({
              transform: Transform.multiply(Transform.translate(0, 0, 100), Transform.rotateX(180 * Math.PI / 180))
            })).add(back)
            cube.add(new StateModifier({
              transform: Transform.multiply(Transform.translate(0, 0, 100), Transform.rotateY(90 * Math.PI / 180))
            })).add(right)
            cube.add(new StateModifier({
              transform: Transform.multiply(Transform.translate(0, 0, 100), Transform.rotateY(-90 * Math.PI / 180))
            })).add(left)
            cube.add(new StateModifier({
              transform: Transform.multiply(Transform.translate(0, 0, 100), Transform.rotateX(90 * Math.PI / 180))
            })).add(top)
            cube.add(new StateModifier({
              transform: Transform.multiply(Transform.translate(0, 0, 100), Transform.rotateX(-90 * Math.PI / 180))
            })).add(bottom)
            */


            // setup context
            mainContext.setPerspective(2400);

            mainContext.add(dialogModifier).add(dialog)
            mainContext.add(explosionModifier).add(explosion)
            mainContext.add(actionLogModifier).add(actionLogRenderController)
          }, 500)
        }
      }
    })
})
