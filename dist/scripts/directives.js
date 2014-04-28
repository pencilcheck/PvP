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
              size: [undefined, 100],
              classes: ['red-bg'],
              content: 'What should we do?',
              properties: {
                lineHeight: "100px",
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
              size: [undefined, 200],
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
              content: 'CLICK ME TO TOGGLE AWESOMESAUCE',
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



            var explosionModifier = new StateModifier({
              origin: [.5, .5]
            })
            var explosion = new Surface({
              size: [500, 500],
              classes: ['explosion']
            })



            // Shared
            function scaffoldPlayer(opponent) {
              var playerData, playerNode

              // Data
              if (!opponent) {
                playerData = {
                  bubbleSurfaceClasses: ['bubble-famous'],
                  heartIndex: 0,
                  chainOfHeartsOutputFunction: function (input, offset, index) {
                    var ringTransform = Transform.translate(-25 + 200, -25 + 200, 0)

                    ringTransform = Transform.multiply(Transform.aboutOrigin([200, 0, 200], Transform.rotateY(360 * index / 10 * Math.PI / 180 + this.heartIndex)), ringTransform)
                    ringTransform = Transform.multiply(Transform.rotateX(20 * Math.PI / 180), ringTransform)
                    ringTransform = Transform.multiply(Transform.rotateZ(20 * Math.PI / 180), ringTransform)

                    return {
                      transform: ringTransform,
                      target: input.render()
                    }
                  },
                  planetRotateAngle: 0,
                  planetRotateDirection: 1,
                  bubbleNodeModifierTransform: Transform.translate(-50, -300, 0)
                }

                playerNode = mainContext.add(new StateModifier({origin: [.2, .8]}))
              } else {
                playerData = {
                  bubbleSurfaceClasses: ['bubble2-famous'],
                  heartIndex: 0,
                  chainOfHeartsOutputFunction: function (input, offset, index) {
                    var ringTransform = Transform.translate(-25 + 200, -25 + 200, 0)

                    ringTransform = Transform.multiply(Transform.aboutOrigin([200, 0, 200], Transform.rotateY(360 * index / 10 * Math.PI / 180 + this.heartIndex)), ringTransform)
                    ringTransform = Transform.multiply(Transform.rotateX(20 * Math.PI / 180), ringTransform)
                    ringTransform = Transform.multiply(Transform.rotateZ(20 * Math.PI / 180), ringTransform)

                    return {
                      transform: ringTransform,
                      target: input.render()
                    }
                  },
                  planetRotateAngle: 0,
                  planetRotateDirection: 1,
                  bubbleNodeModifierTransform: Transform.translate(50, 300, 0)
                }

                playerNode = mainContext.add(new Modifier({origin: [.8, .2]}))
              }

              // Famous scaffolding
              var setupPlanetNode = function () {
                var node = new RenderNode()
                var planetNode = new RenderNode()

                function setupPlanet() {
                  var node = new RenderNode()

                  var planetSurface = new ImageSurface({
                    size: [300, 300],
                  })

                  var planetModifier = new StateModifier({ origin: [.5, .5] })

                  function setupChainOfHearts() {
                    var chainOfHearts = new SequentialLayout()
                    var hearts = []

                    chainOfHearts.setOutputFunction(playerData.chainOfHeartsOutputFunction.bind(playerData))
                    chainOfHearts.sequenceFrom(hearts)

                    var rerender = function (health, oldHealth) {
                      if (health != oldHealth) {
                        if (health == 0) {
                          chainOfHearts.sequenceFrom([new Surface()])
                        } else {
                          hearts.length = 0
                          _.range(health).forEach(function (index) {
                            var heart = new ImageSurface({
                              size: [50, 50],
                              content: 'images/misc/life.png',
                            })
                            hearts.push(heart)
                          })
                        }

                        chainOfHearts.render()
                      }

                      var prefix = opponent ? 'blue' : 'pink'
                      if (health == 10) {
                        planetSurface.setContent('images/planets/' + prefix + '-state1.png')
                      } else if (health < 10 && health >= 5) {
                        planetSurface.setContent('images/planets/' + prefix + '-state2.png')
                      } else if (health < 5) {
                        planetSurface.setContent('images/planets/' + prefix + '-state3.png')
                      }
                    }

                    function rotateHealthRing() {
                      chainOfHearts.render()
                      playerData.heartIndex += 0.01
                    }
                    registerPlanetHoverEffects(planetSurface, [rotateHealthRing])

                    if (!opponent) {
                      rerender(scope.health)
                      scope.$watch('health', rerender)
                    } else {
                      rerender(scope.opponentHealth)
                      scope.$watch('opponentHealth', rerender)
                    }

                    return chainOfHearts
                  }

                  function registerPlanetHoverEffects(surface, fns) {
                    surface.on('mouseover', function (e) {
                      fns.forEach(function (fn) {
                        Engine.on('prerender', fn)
                      })
                    })

                    surface.on('mouseout', function (e) {
                      fns.forEach(function (fn) {
                        Timer.clear(fn)
                      })
                      planetModifier.setTransform(Transform.rotateZ(0))
                    })
                  }

                  function wigglePlanets() {
                    planetModifier.setTransform(Transform.rotateZ(playerData.planetRotateAngle))
                    if (playerData.planetRotateDirection) {
                      playerData.planetRotateAngle += 1 * Math.PI / 180
                    } else {
                      playerData.planetRotateAngle -= 1 * Math.PI / 180
                    }
                    if (playerData.planetRotateAngle >= Math.PI / 180) {
                      playerData.planetRotateDirection = 0
                    } else if (playerData.planetRotateAngle <= -Math.PI / 180) {
                      playerData.planetRotateDirection = 1
                    }
                  }
                  registerPlanetHoverEffects(planetSurface, [wigglePlanets])

                  node.add(setupChainOfHearts())
                  node.add(planetModifier).add(planetSurface)

                  return node
                }

                planetNode.add(setupPlanet())

                node.add(new StateModifier({ size: [300, 300] })).add(planetNode)

                return node
              }

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

                  scope.$watch('attack', function (newVal) {
                    if (newVal) {
                      chosenAttack.setClasses([newVal.attackCss])
                      chosenAttack.setProperties({
                        tooltip: newVal.name
                      })
                    } else {
                      chosenAttack.setClasses([])
                      chosenAttack.setProperties({
                        tooltip: ''
                      })
                    }
                  })

                  scope.$watch('attackCommitted()', function (newVal) {
                    console.log('attackCommitted', newVal)
                    // TODO: rendercontroller to ease transition?
                    if (newVal) {
                      bubbleSurface.setContent(scope.form.smackTalk || '')
                      toggleBubbleRenderController.show(chosenAttackNode)
                    } else {
                      bubbleSurface.setContent('')
                      toggleBubbleRenderController.show(choosingAttackNode)
                    }
                  })

                  choosingAttackNode.add(new StateModifier({origin: [.5, .8]})).add(attackButtonsLayout)
                  choosingAttackNode.add(new StateModifier({origin: [.5, .1]})).add(smackTalkSurface)
                } else {
                  toggleBubbleRenderController.show(chosenAttackNode)

                  scope.$watch('opponentAttack', function (newVal) {
                    console.log('opponentAttack', newVal)
                    if (newVal) {
                      chosenAttack.setClasses([newVal.attackCss])
                      chosenAttack.setProperties({
                        tooltip: newVal.name
                      })
                    } else {
                      chosenAttack.setClasses([])
                      chosenAttack.setProperties({
                        tooltip: ''
                      })
                    }
                  })

                  scope.$watch('opponentSmackTalk', function (newVal) {
                    if (newVal) {
                      bubbleSurface.setContent(newVal)
                    } else {
                      if (scope.notSeenAnimation) {
                        bubbleSurface.setContent('')
                      } else {
                        bubbleSurface.setContent('...')
                      }
                    }
                  })
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


            var overlayRenderController = new RenderController()

            var overlayNode = new RenderNode()

            var overlayEmptySurface = new Surface()

            var animationOverlayModifier = new StateModifier({
              origin: [0, 0]
            })

            var animationOverlay = new Surface({
              size: [undefined, undefined],
              classes: ['overlay']
            })

            var animationContainerModifier = new StateModifier({
              origin: [.5, .5],
            })

            var animationButton = new Surface({
              size: [170, 120],
              classes: ['start-animation-btn-famous']
            })

            animationButton.on('click', function () {
                // Show heart drop and attack animation 
            })

            var skipAnimationModifier = new StateModifier({
              transform: Transform.translate(0, 70, 2)
            })

            var skipAnimation = new Surface({
              size: [170, true],
              content: 'Skip animation',
              properties: {
                lineHeight: "25px",
                textAlign: "center",
                color: "white",
                cursor: "pointer"
              }
            })

            skipAnimation.on('click', function () {
              scope.safeApply(function () {
                scope.$parent.notSeenAnimation = false
              })
            })

            overlayNode.add(animationOverlayModifier).add(animationOverlay)
            var test = overlayNode.add(animationContainerModifier)
            test.add(animationButton)
            test.add(skipAnimationModifier).add(skipAnimation)

            scope.$watch('notSeenAnimation', function (newVal) {
              console.log('famous notSeenAniatmion watch', newVal)
              if (newVal) {
                // Show start animation button
                overlayRenderController.show(overlayNode)
              } else {
                // Hide start animation button
                overlayRenderController.show(overlayEmptySurface)
              }
            })

            overlayRenderController.show(overlayEmptySurface)


            scope.$watch('dialog', function (newVal) {
              dialog.setContent(newVal)
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
                  temp.pipe(actionLog);
                  logs.push(temp)
                })
                console.log(logs)
              }
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
            mainContext.add(overlayRenderController)

            mainContext.add(scaffoldPlayer())
            mainContext.add(scaffoldPlayer(true))
          }, 500)
        }
      }
    })
})
