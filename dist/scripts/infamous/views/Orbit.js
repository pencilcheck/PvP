/*globals define*/
define(function(require, exports, module) {
    var Surface = require('famous/core/Surface');
    var Transform = require('famous/core/Transform');
    var Modifier = require('famous/core/Modifier');
    var OptionsManager = require('famous/core/OptionsManager');
    var RenderNode = require('famous/core/RenderNode')
    var EventHandler = require('famous/core/EventHandler');
    var StateModifier = require('famous/modifiers/StateModifier');
    var ImageSurface = require('famous/surfaces/ImageSurface');

    function Orbit(options) {
        this.options = Object.create(Orbit.DEFAULT_OPTIONS);
        this._optionsManager = new OptionsManager(this.options);

        this._initialTime = Date.now();
        this._speed = this.options.speed;
        this._radius = this.options.radius;
        this._direction = this.options.direction;
        this._objects = [];

        if (options) this.setOptions(options);

        this._eventInput = new EventHandler();
        EventHandler.setInputHandler(this, this._eventInput);
    }

    Orbit.DEFAULT_OPTIONS = {
        direction: 'clockwise',
        speed: .002,
        radius: 300
    };

    Orbit.prototype.setOptions = function setOptions(options) {
        return this._optionsManager.setOptions(options);
    };

    Orbit.prototype.sequenceFrom = function (objects) {
        this._objects = objects;
    };

    Orbit.prototype.render = function () {
        var orbits = [];
        var initialTime = this._initialTime;
        var width = Math.sqrt(Math.pow(this._radius, 2) / 2);

        var node = new RenderNode();
        this._objects.forEach(function (object, index) {
            var offset = index / (2*Math.PI);
            var now = Date.now();

            // Perspective will take care of symmetry
            var transform = Transform.multiply(Transform.rotateX(90 * Math.PI / 180), Transform.thenMove(Transform.aboutOrigin([-width, -width, 0], Transform.rotateZ((this._direction == 'clockwise' ? 1 : -1) * this._speed * (now - this._initialTime) + offset)), [width, width, 0]));

            var reverse = Transform.multiply(Transform.rotateZ(-((this._direction == 'clockwise' ? 1 : -1) * this._speed * (now - this._initialTime) + offset)), Transform.rotateX(-90 * Math.PI / 180));

            orbits.push({
                target: {
                    transform: transform,
                    target: {
                        transform: reverse,
                        target: object.render()
                    }
                }
            });
        }, this);

        return {
            size: [width, width],
            target: {
                origin: [.5, .5],
                target: orbits
            }
        }
    };

    module.exports = Orbit;
});
