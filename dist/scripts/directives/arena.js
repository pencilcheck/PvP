define(function (require) {
  'user strict'

  return function ($timeout) {
    return {
      restrict: 'AE',
      link: function(scope, element) {
        $timeout(function () {
          // import dependencies
          var Engine = require('famous/core/Engine')
          var Surface = require('famous/core/Surface')
          var StateModifier = require('famous/modifiers/StateModifier')
          var RenderNode = require('famous/core/RenderNode')
          var Transform = require('famous/core/Transform')
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
            size: [200, true],
            content: 'Or click here to skip animation',
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

          scope.$watch('form.smackTalk', function (newVal) {
            playerDashboard.setSmackTalk(newVal);
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

          scope.$on('takeDamage', function (event, result) {
            playerPlanet.takeDamage(result[0])
            opponentPlanet.takeDamage(result[1])
          })

          scope.$watch('notSeenAnimation', function (newVal) {
            if (newVal) {
              // Show start animation button
              animationOverlay.show()
              playerPlanet.showDamage()
              opponentPlanet.showDamage()
            } else {
              // Hide start animation button
              animationOverlay.hide()

              playerPlanet.setHealth(scope.health);
              opponentPlanet.setHealth(scope.opponentHealth);
              playerPlanet.hideDamage()
              opponentPlanet.hideDamage()
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
          //fightScene.id['animationArea'].add(explosion);
          fightScene.id['animationOverlay'].add(animationOverlay);
          fightScene.id['player'].add(playerPlanet);
          fightScene.id['opponent'].add(opponentPlanet);
          fightScene.id['playerDashboard'].add(playerDashboard);
          fightScene.id['opponentDashboard'].add(opponentDashboard);
          mainContext.add(fightScene)
        }, 500)
      }
    }
  };
})
