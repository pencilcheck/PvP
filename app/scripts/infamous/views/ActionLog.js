/*globals define*/
define(function(require, exports, module) {
    var Surface = require('famous/core/Surface');
    var Transform = require('famous/core/Transform');
    var StateModifier = require('famous/modifiers/StateModifier');
    var RenderController = require("famous/views/RenderController");
    var ContainerSurface = require("famous/surfaces/ContainerSurface");
    var OptionsManager = require('famous/core/OptionsManager');
    var Scrollview = require('famous/views/Scrollview');

    /*
     * @name ActionLogView
     * @constructor
     * @description
     */

    function ActionLog(options) {
        RenderController.apply(this, arguments)
        this.options = Object.create(ActionLog.DEFAULT_OPTIONS);
        this._optionsManager = new OptionsManager(this.options);
        if (options) this.setOptions(options);

        this.trigger = new Surface({
          size: [undefined, 100],
          properties: {
            lineHeight: "100px",
            textAlign: "center"
          },
          content: 'CLICK ME TO TOGGLE AWESOMESAUCE',
        });

        this.actionLog = new Scrollview();

        this.logContainer = new ContainerSurface({
          size: [undefined, 200],
          properties: {
              overflow: 'hidden'
          },
          classes: ['console-log-famous'],
        });

        this.logContainer.add(this.actionLog);

        this.trigger.on('click', function () {
          this.show(this.logContainer);
        });

        this.logContainer.on('click', function () {
          this.show(this.trigger);
        });

        this.show(this.trigger);
    }
    ActionLog.prototype = Object.create(RenderController.prototype);
    ActionLog.prototype.constructor = ActionLog;

    ActionLog.DEFAULT_OPTIONS = OptionsManager.patch(RenderController.DEFAULT_OPTIONS, {
    });

    ActionLog.prototype.sequenceFrom = function (logs) {
        this.actionLog.sequenceFrom(logs);
    };

    module.exports = ActionLog;
});
