/*globals define*/
define(function(require, exports, module) {
    var Surface = require('famous/core/Surface');
    var ImageSurface = require('famous/surfaces/ImageSurface');
    var Transform = require('famous/core/Transform');
    var StateModifier = require('famous/modifiers/StateModifier');
    var OptionsManager = require('famous/core/OptionsManager');
    var EventHandler = require('famous/core/EventHandler');

    function Dashboard(options) {
        this.options = Object.create(Dashboard.DEFAULT_OPTIONS);
        this._optionsManager = new OptionsManager(this.options);
        if (options) this.setOptions(options);

        this._health = 10;
        this._prototype = {};

        this._bubble = new Surface({
            properties: {
              lineHeight: "100px",
              textAlign: "center",
              fontSize: '22px',
              color: '#ACD6E5',
            }
        });

        this._eventInput = new EventHandler();
        EventHandler.setInputHandler(this, this._eventInput);
    }

    Dashboard.DEFAULT_OPTIONS = {
        facing: 'down'
    };

    Dashboard.prototype.setOptions = function setOptions(options) {
        return this._optionsManager.setOptions(options);
    };

    Dashboard.prototype.render = function () {
        var bubbleClasses = this.options.facing == 'down' ? ['bubble-famous'] : ['bubble2-famous'];
        var transform = this.options.facing == 'down' ? Transform.translate(-50, -300, 0) : Transform.translate(50, 300, 0);

        return [
            {
                // A workaround to anchor for a subelement suggested by mlu on #famous
                // I think origin needs a size at the parent context, so 
                // giving a size will be able to let it change anchor
                size: [350, 150],
                target: {
                    origin: [.5, .5],
                    transform: transform,
                    target: [
                        this._bubble.render()
                    ]
                }
            },
        ]
    };

    module.exports = Dashboard;
});
