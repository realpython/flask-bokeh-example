var ActionTool, GestureTool, HelpTool, InspectTool, Toolbar, ToolbarBase, _, p,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

p = require("../../core/properties");

ActionTool = require("./actions/action_tool");

HelpTool = require("./actions/help_tool");

GestureTool = require("./gestures/gesture_tool");

InspectTool = require("./inspectors/inspect_tool");

ToolbarBase = require("./toolbar_base");

Toolbar = (function(superClass) {
  extend(Toolbar, superClass);

  function Toolbar() {
    return Toolbar.__super__.constructor.apply(this, arguments);
  }

  Toolbar.prototype.type = 'Toolbar';

  Toolbar.prototype.default_view = ToolbarBase.View;

  Toolbar.prototype.initialize = function(attrs, options) {
    Toolbar.__super__.initialize.call(this, attrs, options);
    this.listenTo(this, 'change:tools', this._init_tools);
    return this._init_tools();
  };

  Toolbar.prototype._init_tools = function() {
    var et, i, len, ref, results, tool, tools;
    ref = this.tools;
    for (i = 0, len = ref.length; i < len; i++) {
      tool = ref[i];
      if (tool instanceof InspectTool.Model) {
        if (!_.some(this.inspectors, (function(_this) {
          return function(t) {
            return t.id === tool.id;
          };
        })(this))) {
          this.inspectors = this.inspectors.concat([tool]);
        }
      } else if (tool instanceof HelpTool.Model) {
        if (!_.some(this.help, (function(_this) {
          return function(t) {
            return t.id === tool.id;
          };
        })(this))) {
          this.help = this.help.concat([tool]);
        }
      } else if (tool instanceof ActionTool.Model) {
        if (!_.some(this.actions, (function(_this) {
          return function(t) {
            return t.id === tool.id;
          };
        })(this))) {
          this.actions = this.actions.concat([tool]);
        }
      } else if (tool instanceof GestureTool.Model) {
        et = tool.event_type;
        if (!(et in this.gestures)) {
          logger.warn("Toolbar: unknown event type '" + et + "' for tool: " + tool.type + " (" + tool.id + ")");
          continue;
        }
        if (!_.some(this.gestures[et].tools, (function(_this) {
          return function(t) {
            return t.id === tool.id;
          };
        })(this))) {
          this.gestures[et].tools = this.gestures[et].tools.concat([tool]);
        }
        this.listenTo(tool, 'change:active', _.bind(this._active_change, tool));
      }
    }
    results = [];
    for (et in this.gestures) {
      tools = this.gestures[et].tools;
      if (tools.length === 0) {
        continue;
      }
      this.gestures[et].tools = _.sortBy(tools, function(tool) {
        return tool.default_order;
      });
      if (et === 'tap') {
        if (this.active_tap === null) {
          continue;
        }
        if (this.active_tap === 'auto') {
          this.gestures[et].tools[0].active = true;
        } else {
          this.active_tap.active = true;
        }
      }
      if (et === 'pan') {
        if (this.active_drag === null) {
          continue;
        }
        if (this.active_drag === 'auto') {
          this.gestures[et].tools[0].active = true;
        } else {
          this.active_drag.active = true;
        }
      }
      if (et === 'pinch' || et === 'scroll') {
        if (this.active_scroll === null || this.active_scroll === 'auto') {
          continue;
        }
        results.push(this.active_scroll.active = true);
      } else {
        results.push(void 0);
      }
    }
    return results;
  };

  Toolbar.define({
    active_drag: [p.Any, 'auto'],
    active_scroll: [p.Any, 'auto'],
    active_tap: [p.Any, 'auto']
  });

  return Toolbar;

})(ToolbarBase.Model);

module.exports = {
  Model: Toolbar
};
