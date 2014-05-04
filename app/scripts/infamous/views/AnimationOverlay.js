/*globals define*/
define(function(require, exports, module) {
    var Surface = require('famous/core/Surface');
    var Transform = require('famous/core/Transform');
    var StateModifier = require('famous/modifiers/StateModifier');
    var ContainerSurface = require("famous/surfaces/ContainerSurface");
    var OptionsManager = require('famous/core/OptionsManager');
    var RenderNode = require('famous/core/RenderNode');
    var RenderController = require("famous/views/RenderController");
    var EventHandler = require('famous/core/EventHandler');

    function AnimationOverlay(options) {
        this._controller = new RenderController();

        this._empty = new Surface();
        this._overlay = new RenderNode();
        this._node = new RenderNode();

        this._overlay.add(new Surface({
            size: [undefined, undefined],
            classes: ['overlay']
        }));
        this._overlay.add(new StateModifier({ origin: [.5, .5] })).add(this._node);

        this._eventInput = new EventHandler();
        EventHandler.setInputHandler(this, this._eventInput);

        this.hide();

        if (options) this.setOptions(options);
    }

    AnimationOverlay.prototype.setOptions = function setOptions(options) {
        this._controller.setOptions(options);
    };

    AnimationOverlay.prototype.setNode = function setNode(obj) {
        this._node.set(obj);
    };

    AnimationOverlay.prototype.show = function (callback) {
        this._controller.show(this._overlay);
    };

    AnimationOverlay.prototype.hide = function (callback) {
        this._controller.show(this._empty);
    };

    AnimationOverlay.prototype.render = function render() {
        return {
            origin: [.5, .5],
            target: this._controller.render()
        };
    };

    module.exports = AnimationOverlay;
});
