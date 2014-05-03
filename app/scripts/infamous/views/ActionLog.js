/*globals define*/
define(function(require, exports, module) {
    var Surface = require('famous/core/Surface');
    var Transform = require('famous/core/Transform');
    var StateModifier = require('famous/modifiers/StateModifier');
    var RenderController = require("famous/views/RenderController");
    var ContainerSurface = require("famous/surfaces/ContainerSurface");
    var OptionsManager = require('famous/core/OptionsManager');
    var Scrollview = require('famous/views/Scrollview');
    var EventHandler = require('famous/core/EventHandler');

    /*
     * @name ActionLogView
     * @constructor
     * @description
     */

    function ActionLog(options) {
        this._logs = [];
        this._state = 0;
        this._currentTarget = null;

        this._controller = new RenderController();

        this._eventInput = new EventHandler();
        EventHandler.setInputHandler(this, this._eventInput);

        this._trigger = new Surface({
          size: [undefined, 100],
          properties: {
            lineHeight: "100px",
            textAlign: "center"
          },
          content: 'CLICK ME TO TOGGLE AWESOMESAUCE',
        });

        this._scroll = new Scrollview();

        this._container = new ContainerSurface({
          size: [undefined, 200],
          properties: {
              overflow: 'hidden'
          },
          classes: ['console-log-famous'],
        })

        this._container.add(this._scroll);

        this.hide();

        if (options) this.setOptions(options);
    }

    function _pipe(target) {
        // stop sending input to old target
        if (this._currentTarget) this._eventInput.unpipe(this._currentTarget);

        this._currentTarget = target;

        // start sending input to new target
        if (this._currentTarget && this._currentTarget.trigger) this._eventInput.pipe(this._currentTarget);

        this._currentTarget.on('click', function () {
          this._state = this._state ? 0: 1;
          if (this._state) {
              this.show();
          } else {
              this.hide();
          }
        }.bind(this));
    }

    ActionLog.prototype.setOptions = function setOptions(options) {
        this._controller.setOptions(options);
    };

    ActionLog.prototype.show = function () {
        _pipe.call(this, this._container);

        this._controller.show(this._currentTarget);
    };

    ActionLog.prototype.hide = function () {
        _pipe.call(this, this._trigger);

        this._controller.show(this._currentTarget);
    };

    ActionLog.prototype.sequenceFrom = function (logs) {
        this._logs = logs;
        this._scroll.sequenceFrom(logs);
    };

    ActionLog.prototype.render = function () {
        this._logs.forEach(function (log) {
          log.pipe(this._scroll);
        }, this);

        return {
          target: this._controller.render()
        }
    };

    module.exports = ActionLog;
});
