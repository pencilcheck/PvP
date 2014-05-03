/*globals define*/
define(function(require, exports, module) {
    var Surface = require('famous/core/Surface');
    var Transform = require('famous/core/Transform');
    var Transitionable = require('famous/transitions/Transitionable');
    var StateModifier = require('famous/modifiers/StateModifier');
    var ContainerSurface = require("famous/surfaces/ContainerSurface");
    var OptionsManager = require('famous/core/OptionsManager');
    var RenderNode = require('famous/core/RenderNode');

    /*
     * @name AnimationOverlay
     * @constructor
     * @description
     */

    function AnimationOverlay(options) {
        this.options = Object.create(AnimationOverlay.DEFAULT_OPTIONS);
        this._optionsManager = new OptionsManager(this.options);
        if (options) this.setOptions(options);

        this.state = new Transitionable(0);

        this.node = new RenderNode();

        this.overlay = new Surface({
          size: [undefined, undefined],
          classes: ['overlay']
        });
    }

    AnimationOverlay.DEFAULT_OPTIONS = {
    };

    AnimationOverlay.prototype.setOptions = function setOptions(options) {
        return this._optionsManager.setOptions(options);
    };

    AnimationOverlay.prototype.setNode = function setNode(obj) {
        return this.node.set(obj);
    };

    AnimationOverlay.prototype.show = function (callback) {
        this.state.set(1, this, callback);
    };

    AnimationOverlay.prototype.hide = function (callback) {
        this.state.set(0, true, callback);
    };

    AnimationOverlay.prototype.render = function render() {
        var opacity = this.state.get();

        return [
            {
                target: this.overlay.render()
            },
            {
                transform: {
                  origin: [.5, .5]
                },
                opacity: opacity,
                target: this.node.render()
            }
        ]
    };

    module.exports = AnimationOverlay;
});
