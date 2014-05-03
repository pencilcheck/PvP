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
                lineHeight: "25px",
                textAlign: "center",
                color: "white",
                cursor: "pointer"
              }
            })

            var animationOverlay = new AnimationOverlay();

            var test = new RenderNode();
            test.add(animationButton);
            test.add(new StateModifier({
              transform: Transform.translate(0, 70, 2)
            })).add(skipAnimation);
            animationOverlay.setNode(test);

            // Shared
            var rerender
            function scaffoldPlayer(opponent) {
              var playerData, playerNode

              // Data
              if (!opponent) {
                playerData = {
                  bubbleSurfaceClasses: ['bubble-famous'],
                  heartIndex: 0,
                  heartRingOutputFunction: function (input, offset, index) {
                    var ringTransform = Transform.translate(250, 180, 0)

                    // Origin stays the same even if it is translated, therefore x and y needs to match, z is there to let it rotate tagent to its rotation curve
                    ringTransform = Transform.multiply(Transform.aboutOrigin([250, 180, 240], Transform.rotateY(360 * index / 10 * Math.PI / 180 + this.heartIndex)), ringTransform)
                    ringTransform = Transform.multiply(Transform.rotateX(30 * Math.PI / 180), ringTransform)
                    ringTransform = Transform.multiply(Transform.rotateZ(25 * Math.PI / 180), ringTransform)

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
                  heartRingOutputFunction: function (input, offset, index) {
                    var ringTransform = Transform.translate(0, 325, 0)

                    // Origin stays the same even if it is translated, therefore x and y needs to match, z is there to let it rotate tagent to its rotation curve
                    ringTransform = Transform.multiply(Transform.aboutOrigin([0, 325, 240], Transform.rotateY(360 * index / 10 * Math.PI / 180 + this.heartIndex)), ringTransform)
                    ringTransform = Transform.multiply(Transform.rotateX(25 * Math.PI / 180), ringTransform)
                    ringTransform = Transform.multiply(Transform.rotateZ(-25 * Math.PI / 180), ringTransform)

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

                  var planetOrbitSurface = new ImageSurface({
                    size: [500, 300],
                  })

                  if (opponent) {
                    planetOrbitSurface.setContent('images/misc/orbit.png')
                  } else {
                    planetOrbitSurface.setContent('images/misc/orbit-flip.png')
                  }

                  var planetModifier = new StateModifier({ origin: [.5, .5] })

                  function setupHeartRing() {
                    var heartRing = new SequentialLayout()
                    var hearts = [new Surface()]

                    heartRing.setOutputFunction(playerData.heartRingOutputFunction.bind(playerData))
                    heartRing.sequenceFrom(hearts)

                    // Update visuals, should only be called when scope.notSeenAnimation is false
                    rerender = function () {
                      var health
                      if (!opponent) {
                        health = scope.health
                      } else {
                        health = scope.opponentHealth
                      }

                      if (health == 0) {
                        heartRing.sequenceFrom([new Surface()])
                      } else {
                        hearts.length = 0
                        _.range(health).forEach(function (index) {
                          var heart = new ImageSurface({
                            size: [50, 50],
                            //content: 'images/misc/life.png',
                            content: 'images/misc/heart.png',
                          })
                          hearts.push(heart)
                        })
                      }

                      heartRing.render()

                      var prefix = opponent ? 'blue' : 'pink'
                      if (health == 10) {
                        planetSurface.setContent('images/planets/' + prefix + '-state1.png')
                      } else if (health < 10 && health >= 5) {
                        planetSurface.setContent('images/planets/' + prefix + '-state2.png')
                      } else if (health < 5) {
                        planetSurface.setContent('images/planets/' + prefix + '-state3.png')
                      }
                    }
                    rerender()

                    function rotateHealthRing() {
                      heartRing.render()
                      playerData.heartIndex += 0.01
                    }
                    Engine.on('prerender', rotateHealthRing)

                    //if (!opponent) {
                      //rerender(scope.health)
                      //scope.$watch('health', rerender)
                    //} else {
                      //rerender(scope.opponentHealth)
                      //scope.$watch('opponentHealth', rerender)
                    //}

                    return heartRing
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

                  node.add(setupHeartRing())
                  var t = node.add(planetModifier)
                  t.add(planetSurface)
                  t.add(new StateModifier({transform: Transform.translate(0, 50, 0)})).add(planetOrbitSurface)

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




            animationButton.on('click', function () {
                // Show heart drop and attack animation 
            })

            skipAnimation.on('click', function () {
              scope.safeApply(function () {
                scope.$parent.notSeenAnimation = false
              })
            })


            scope.$watch('notSeenAnimation', function (newVal) {
              console.log('famous notSeenAniatmion watch', newVal)

              if (newVal) {
                // Show start animation button
                animationOverlay.show()
              } else {
                // Hide start animation button
                animationOverlay.hide()
                //rerender()
              }
            })

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
                  logs.push(temp)
                })
                console.log(logs)
              }
            })



            // setup context
            mainContext.setPerspective(2400);

            fightScene.id['dialog'].add(dialog);
            fightScene.id['actionLog'].add(actionLog);
            fightScene.id['animationArea'].add(explosion);
            fightScene.id['animationOverlay'].add(animationOverlay);
            mainContext.add(fightScene)

            mainContext.add(scaffoldPlayer())
            mainContext.add(scaffoldPlayer(true))
          }, 500)
        }
      }
    })
})
