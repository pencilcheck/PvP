/*globals define*/
define(function(require, exports, module) {
    var Surface = require('famous/core/Surface');
    var ImageSurface = require('famous/surfaces/ImageSurface');
    var Transform = require('famous/core/Transform');
    var StateModifier = require('famous/modifiers/StateModifier');
    var OptionsManager = require('famous/core/OptionsManager');
    var EventHandler = require('famous/core/EventHandler');
    var Orbit = require("infamous/views/Orbit");

    function Planet(options) {
        this.options = Object.create(Planet.DEFAULT_OPTIONS);
        this._optionsManager = new OptionsManager(this.options);
        if (options) this.setOptions(options);

        this._currentTakenDamage = 0
        this._health = 10;
        this._prototype = {};

        this._takeDamageNumber = new Surface({
          size: [100, true],
          content: '',
          properties: {
              lineHeight: "100px",
              fontSize: "5em",
              textAlign: "center",
              color: "red"
          }
        });

        this._healthNumber = new Surface({
          size: [100, true],
          content: this._health,
          properties: {
              lineHeight: "100px",
              fontSize: "5em",
              textAlign: "center",
              color: "white"
          }
        });

        this._planet = new ImageSurface({
            size: [300, 300],
        });
        this._ring = new ImageSurface({
            size: [500, 300],
        });
        this._orbit = new Orbit({
            radius: 300
        });
        this._ringSurfaces = [new Surface()];

        this._orbit.sequenceFrom(this._ringSurfaces);

        this._eventInput = new EventHandler();
        EventHandler.setInputHandler(this, this._eventInput);
    }

    Planet.DEFAULT_OPTIONS = {
        facing: 'right'
    };

    Planet.prototype.setOptions = function setOptions(options) {
        return this._optionsManager.setOptions(options);
    };

    Planet.prototype.setHealth = function (health) {
        this._health = health;
        this.initializeSurfaces();
        return this;
    };

    Planet.prototype.initializeSurfaces = function () {
        this._ringSurfaces.length = 0
        _.range(this._health).forEach(function (index) {
            this._ringSurfaces.push(new ImageSurface(this._prototype));
        }, this);
    };

    Planet.prototype.setHeartSurfacePrototype = function (prototype) {
        this._prototype = prototype;
        this.initializeSurfaces();
        return this;
    }

    Planet.prototype.takeDamage = function (damageTaken) {
        this._currentTakenDamage = damageTaken
    }

    Planet.prototype.showDamage = function () {
        this._takeDamageNumber.setContent('-' + this._currentTakenDamage)
    }

    Planet.prototype.hideDamage = function () {
        this._takeDamageNumber.setContent('')
    }

    Planet.prototype.render = function () {
        var prefix = this.options.facing == 'right' ? 'pink' : 'blue';
        var tilt = this.options.facing == 'right' ? -20 : -20;

        if (this._health == 10) {
          this._planet.setContent('images/planets/' + prefix + '-state1.png');
        } else if (this._health < 10 && this._health >= 5) {
          this._planet.setContent('images/planets/' + prefix + '-state2.png');
        } else if (this._health < 5) {
          this._planet.setContent('images/planets/' + prefix + '-state3.png');
        }

        this._healthNumber.setContent(this._health);

        this._ring.setContent(this.options.facing == 'right' ? 'images/misc/orbit-flip.png' : 'images/misc/orbit.png')

        return [
            {
                // A workaround to anchor for a subelement suggested by mlu on #famous
                // I think origin needs a size at the parent context, so 
                // giving a size will be able to let it change anchor
                size: this._planet.getSize(),
                target: {
                    origin: [.5, .5],
                    target: [
                        {
                            transform: Transform.rotateZ(tilt * Math.PI / 180),
                            target: this._planet.render(),
                        },
                        this._orbit.render(),
                        this._ring.render(),
                        {
                            transform: Transform.translate((this.options.facing == 'right' ? -1 : 1) * 150, 150, 200),
                            target: this._takeDamageNumber.render()
                        },
                        {
                            transform: Transform.translate((this.options.facing == 'right' ? -1 : 1) * 150, 150, 100),
                            target: this._healthNumber.render()
                        },
                    ]
                }
            },
        ]
    };

    module.exports = Planet;
});
