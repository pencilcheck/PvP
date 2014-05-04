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
            var Timer = require('famous/utilities/Timer');
            var Scrollview = require("famous/views/Scrollview");
            var ContainerSurface = require("famous/surfaces/ContainerSurface");
            var RenderController = require("famous/views/RenderController");
            var Scene = require("famous/core/Scene");

            var ActionLog = require("infamous/views/ActionLog");
            var AnimationOverlay = require("infamous/views/AnimationOverlay");
            var Planet = require("infamous/views/Planet");
            var Dashboard = require("infamous/views/Dashboard");

            // create the main context
            var mainContext = Engine.createContext(element[0])

            var fightScene = new Scene({
              id: 'fightScene',
              target: [
                {
                  origin: [.5, 0],
                  target: {
                    id: 'dialog'
                  }
                },
                {
                  transform: Transform.inFront,
                  origin: [.5, 1],
                  target: {
                    id: 'actionLog'
                  }
                },
                {
                  size: [500, 500],
                  origin: [.5, .5],
                  target: {
                    id: 'animationArea'
                  }
                },
                {
                  size: [undefined, undefined],
                  origin: [.5, .5],
                  target: {
                    id: 'animationOverlay'
                  }
                },
                {
                  origin: [.2, .8],
                  target: {
                    id: 'player'
                  }
                },
                {
                  origin: [.8, .2],
                  target: {
                    id: 'opponent'
                  }
                },
                {
                  origin: [.2, .8],
                  target: {
                    id: 'playerDashboard'
                  }
                },
                {
                  origin: [.8, .2],
                  target: {
                    id: 'opponentDashboard'
                  }
                }
              ]
            });

            var dialog = new Surface({
              size: [undefined, 100],
              classes: ['red-bg'],
              content: 'What should we do?',
              properties: {
                lineHeight: "100px",
                textAlign: "center",
                fontSize: "xx-large",
              }
            })

            var logs = []
            var actionLog = new ActionLog()
            actionLog.sequenceFrom(logs)

            var explosion = new Surface({
              classes: ['explosion']
            });

            var animationButton = new Surface({
              size: [170, 120],
              classes: ['start-animation-btn-famous']
            })

            var skipAnimation = new Surface({
              size: [170, true],
              content: 'Skip animation',
              properties: {
                lineHeight: "30px", // 25px is too small on safari to click on
                textAlign: "center",
                color: "white",
                cursor: "pointer"
              }
            })

            var animationOverlay = new AnimationOverlay();
            var test = new RenderNode();
            test.add(animationButton);
            test.add(new StateModifier({
              transform: Transform.translate(0, 70, 10)
            })).add(skipAnimation);
            animationOverlay.setNode(test);

            var heartPrototype = {
              size: [50, 50],
              content: 'images/misc/heart.png',
            };

            var playerPlanet = new Planet();
            playerPlanet.setHealth(scope.health);
            playerPlanet.setHeartSurfacePrototype(heartPrototype);

            var opponentPlanet = new Planet({
              facing: 'left',
            });
            opponentPlanet.setHealth(scope.opponentHealth);
            opponentPlanet.setHeartSurfacePrototype(heartPrototype);

            var playerDashboard = new Dashboard({
              input: true
            });
            playerDashboard.on('keyup', function (e) {
              scope.safeApply(function () {
                scope.$parent.form.smackTalk = playerDashboard.getInputValue();
              });
            });
            playerDashboard.setupButtons(scope.selectedMoves, function (key) {
              scope.safeApply(function () {
                scope.fight(key, scope.form.smackTalk);
              });
            });

            var opponentDashboard = new Dashboard({
              facing: 'up'
            });


            function scaffoldPlayer(opponent) {
              var playerData, playerNode

              // Data
              if (!opponent) {
                playerData = {
                  bubbleSurfaceClasses: ['bubble-famous'],
                  bubbleNodeModifierTransform: Transform.translate(-50, -300, 0)
                }
              } else {
                playerData = {
                  bubbleSurfaceClasses: ['bubble2-famous'],
                  bubbleNodeModifierTransform: Transform.translate(50, 300, 0)
                }
              }

              // Famous scaffolding
              var setupBubbleNode = function () {
                var node = new RenderNode()

                var bubbleSurface = new Surface({
                  classes: playerData.bubbleSurfaceClasses,
                  properties: {
                    lineHeight: "100px",
                    textAlign: "center",
                    fontSize: '22px',
                    color: '#ACD6E5',
                  }
                })

                var bubbleNodeModifier = new StateModifier({
                  size: [350, 150],
                  transform: playerData.bubbleNodeModifierTransform
                })

                var chosenAttack = new Surface({
                  size: [60, 60],
                })

                var toggleBubbleRenderController = new RenderController()

                var bubbleNode = new RenderNode()

                var chosenAttackNode = new RenderNode()

                chosenAttackNode.add(new StateModifier({origin: [.5, .8]})).add(chosenAttack)

                if (!opponent) {
                  var choosingAttackNode = new RenderNode()

                  var smackTalkSurface = new InputSurface({
                    size: [undefined, 40],
                    name: 'smackTalkSurface',
                    placeholder: 'Smack Talk',
                    value: '',
                    type: 'text'
                  })

                  smackTalkSurface.on('keyup', function () {
                    scope.safeApply(function () {
                      scope.$parent.form.smackTalk = smackTalkSurface.getValue()
                    })
                  })

                  var attackButtonsLayout = new SequentialLayout({
                      direction: Utility.Direction.X,
                      size: [200, 60]
                  })

                  function setupAttackButtons() {
                    var buttons = []
                    attackButtonsLayout.sequenceFrom(buttons);

                    var PE = new PhysicsEngine()

                    _.keys(scope.selectedMoves).forEach(function (key, offset) {
                      var info = scope.selectedMoves[key]
                      var attackButton = new Surface({
                        size: [60, 60],
                        classes: [info.attackCss],
                        properties: {
                          tooltip: info.name
                          //backgroundColor: "hsl(" + (i * 360 / 10) + ", 100%, 50%)",
                          //lineHeight: window.innerHeight/10 + "px",
                          //textAlign: "center"
                        }
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
                        particle.applyForce(new Vector(0, 0, -0.005 * 10))
                        scope.fight(key, scope.form.smackTalk)
                      });

                      var renderNode = new RenderNode()
                      renderNode.add(particle).add(attackButton)
                      buttons.push(renderNode)
                    })
                  }
                  setupAttackButtons()

                  choosingAttackNode.add(new StateModifier({origin: [.5, .8]})).add(attackButtonsLayout)
                  choosingAttackNode.add(new StateModifier({origin: [.5, .1]})).add(smackTalkSurface)
                } else {
                  toggleBubbleRenderController.show(chosenAttackNode)

                }

                bubbleNode.add(new StateModifier({origin: [.5, .5]})).add(bubbleSurface)
                bubbleNode.add(new StateModifier({origin: [.5, .5]})).add(toggleBubbleRenderController)

                node.add(bubbleNodeModifier).add(bubbleNode)

                return node
              }


              playerNode.add(setupPlanetNode())
              playerNode.add(setupBubbleNode())

              return playerNode
            }




            animationButton.on('click', function () {
                // Show heart drop and attack animation 
            })

            skipAnimation.on('click', function () {
              scope.safeApply(function () {
                scope.$parent.notSeenAnimation = false
              })
            })

            scope.$watch('attackCommitted()', function (newVal) {
              // TODO: rendercontroller to ease transition?
              playerDashboard.commit(newVal);
              opponentDashboard.commit(newVal);
            })

            scope.$watch('attack', function (newVal) {
              playerDashboard.setChosenAttack(newVal);
            });

            scope.$watch('opponentAttack', function (newVal) {
              opponentDashboard.setChosenAttack(newVal);
            })

            scope.$watch('opponentSmackTalk', function (newVal) {
              opponentDashboard.setSmackTalk(newVal);
            });

            scope.$watch('dialog', function (newVal) {
              dialog.setContent(newVal)
            })

            scope.$watch('notSeenAnimation', function (newVal) {
              console.log('famous notSeenAniatmion watch', newVal)

              if (newVal) {
                // Show start animation button
                animationOverlay.show()
              } else {
                // Hide start animation button
                animationOverlay.hide()

                playerPlanet.setHealth(scope.health);
                opponentPlanet.setHealth(scope.opponentHealth);
              }
            })

            scope.$watch('rounds', function (newVal) {
              if (newVal) {
                logs.length = 0
                newVal.forEach(function (round, i) {
                  var temp = new Surface({
                    properties: {
                      backgroundColor: "hsl(" + (i * 360 / 40) + ", 100%, 50%)",
                      lineHeight: "50px",
                      textAlign: "center"
                    },
                    size: [undefined, 50],
                    content: round.log
                  })
                  logs.push(temp)
                })
              }
            })



            // setup context
            mainContext.setPerspective(1000);

            fightScene.id['dialog'].add(dialog);
            fightScene.id['actionLog'].add(actionLog);
            fightScene.id['animationArea'].add(explosion);
            fightScene.id['animationOverlay'].add(animationOverlay);
            fightScene.id['player'].add(playerPlanet);
            fightScene.id['opponent'].add(opponentPlanet);
            fightScene.id['playerDashboard'].add(playerDashboard);
            fightScene.id['opponentDashboard'].add(opponentDashboard);
            mainContext.add(fightScene)
          }, 500)
        }
      }
    })
})
