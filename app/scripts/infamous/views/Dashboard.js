/*globals define*/
define(function(require, exports, module) {
    var Surface = require('famous/core/Surface');
    var ImageSurface = require('famous/surfaces/ImageSurface');
    var Transform = require('famous/core/Transform');
    var StateModifier = require('famous/modifiers/StateModifier');
    var OptionsManager = require('famous/core/OptionsManager');
    var EventHandler = require('famous/core/EventHandler');
    var InputSurface = require('famous/surfaces/InputSurface');
    var PhysicsEngine = require("famous/physics/PhysicsEngine");
    var SequentialLayout = require("famous/views/SequentialLayout");
    var Utility = require("famous/utilities/Utility");
    var Vector = require("famous/math/Vector");
    var Particle = require("famous/physics/bodies/Particle");
    var Spring = require("famous/physics/forces/Spring");
    var RenderNode = require('famous/core/RenderNode');
    var RenderController = require("famous/views/RenderController");

    function Dashboard(options) {
        this.options = Object.create(Dashboard.DEFAULT_OPTIONS);
        this._optionsManager = new OptionsManager(this.options);
        if (options) this.setOptions(options);

        this._eventInput = new EventHandler();
        EventHandler.setInputHandler(this, this._eventInput);
        this._eventOutput = new EventHandler();
        EventHandler.setOutputHandler(this, this._eventOutput);

        this._smackTalk = ''; // For none input
        this._committed = false;

        this._controller = new RenderController();

        this._bubble = new Surface({
            properties: {
                lineHeight: "100px",
                textAlign: "center",
                fontSize: '22px',
                color: '#ACD6E5',
            }
        });

        this._input = new InputSurface({
            size: [undefined, 40],
            name: 'smackTalkSurface',
            placeholder: 'Smack Talk',
            value: '',
            type: 'text'
        });

        this._attackButtons = new SequentialLayout({
            direction: Utility.Direction.X,
            size: [200, 60]
        })

        this._chosenAttack = new Surface({
            size: [60, 60],
        });

        this._committedRenderNode = new RenderNode();
        this._committedRenderNode.add(new StateModifier({
            transform: Transform.translate(0, 30, 0),
        })).add(this._chosenAttack);

        this._inputRenderNode = new RenderNode();
        this._inputRenderNode.add(new StateModifier({
            transform: Transform.translate(0, -30, 0),
        })).add(this._input);
        this._inputRenderNode.add(new StateModifier({
            transform: Transform.translate(0, 30, 0),
        })).add(this._attackButtons);

        this._input.pipe(this._eventOutput);

        this._input.on('keyup', function () {
            if (this.options.input)
                this._smackTalk = this._input.getValue();
        }.bind(this));
    }

    Dashboard.DEFAULT_OPTIONS = {
        facing: 'down',
        input: false,
    };

    Dashboard.prototype.setOptions = function setOptions(options) {
        return this._optionsManager.setOptions(options);
    };

    Dashboard.prototype.setupButtons = function (moves, callback) {
        var buttons = []
        this._attackButtons.sequenceFrom(buttons);

        var PE = new PhysicsEngine();

        _.keys(moves).forEach(function (key, offset) {
          var info = moves[key]
          var attackButton = new Surface({
            size: [60, 60],
            classes: [info.attackCss],
            properties: {
              tooltip: info.name
            }
          })

          // spring effect
          var particle = new Particle({
            position: [0, 0, 0]
          })

          var spring = new Spring({
            anchor: [0, 0, 0],
            period: 100, 
            dampingRatio: 0.3,
          })

          PE.attach(spring, particle)
          PE.addBody(particle)

          attackButton.on("click", function (e) {
            particle.applyForce(new Vector(0, 0, -0.005 * 10))
            callback(key);
          });

          var renderNode = new RenderNode()
          renderNode.add(particle).add(attackButton)
          buttons.push(renderNode)
        }, this);
    };

    Dashboard.prototype.commit = function (value) {
        this._committed = !!value;
    };

    Dashboard.prototype.setSmackTalk = function (smackTalk) {
        this._smackTalk = smackTalk || '';
        
        if (!this.options.input && !this._committed) {
            this._committed = true;
        }
    };

    Dashboard.prototype.setChosenAttack = function (attack) {
        if (attack) {
            this._chosenAttack.setClasses([attack.attackCss]);
            this._chosenAttack.setProperties({
                tooltip: attack.name
            });

            if (!this.options.input && !this._committed) {
                this._committed = true;
            }
        } else {
            this.unsetChosenAttack();
        }
    };

    Dashboard.prototype.unsetChosenAttack = function () {
        this._chosenAttack.setClasses([]);
        this._chosenAttack.setProperties({
            tooltip: ''
        });

        if (!this.options.input && this._committed) {
            this._committed = false;
        }
    };

    Dashboard.prototype.getInputValue = function () {
        if (this._input) return this._input.getValue();
        return '';
    };

    Dashboard.prototype.render = function () {
        var bubbleClasses = this.options.facing == 'down' ? ['bubble-famous'] : ['bubble2-famous'];
        var transform = this.options.facing == 'down' ? Transform.translate(-70, -300, 0) : Transform.translate(70, 300, 0);

        this._bubble.setClasses(bubbleClasses);

        var contentSpec = [];

        if (this._committed) {
            this._controller.show(this._committedRenderNode);
            /*
            contentSpec.push({
                transform: Transform.translate(0, 30, 0),
                target: this._chosenAttack.render()
            });
            */
            this._bubble.setContent(this._smackTalk);
        } else {
            if (this.options.input) {
                this._controller.show(this._inputRenderNode);
                // Shows input
                /*
                contentSpec.push({
                    transform: Transform.translate(0, -30, 0),
                    target: this._input.render()
                });
                */

                // Attack buttons
                /*
                contentSpec.push({
                    transform: Transform.translate(0, 30, 0),
                    target: this._attackButtons.render()
                });
                */
                this._bubble.setContent('');
            } else {
                // Shows ...
                this._bubble.setContent('...');
                this._controller.hide();
            }
        }

        //contentSpec.push(this._bubble.render());

        return [
            {
                // A workaround to anchor for a subelement suggested by mlu (Mark Lu) on #famous
                // I think origin needs a size at the parent context, so 
                // giving a size will be able to let it change anchor
                size: [350, 150],
                target: {
                    origin: [.5, .5],
                    transform: transform,
                    target: [
                        this._bubble.render(),
                        this._controller.render()
                    ]
                    //target: contentSpec
                }
            },
        ]
    };

    module.exports = Dashboard;
});
