var ActionTool, Box, GestureTool, HelpTool, InspectTool, ToolProxy, ToolbarBase, ToolbarBox, ToolbarBoxToolbar, ToolbarBoxView, _, p,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

p = require("../../core/properties");

ActionTool = require("./actions/action_tool");

HelpTool = require("./actions/help_tool");

GestureTool = require("./gestures/gesture_tool");

InspectTool = require("./inspectors/inspect_tool");

ToolbarBase = require("./toolbar_base");

ToolProxy = require("./tool_proxy").ToolProxy;

Box = require("../layouts/box");

ToolbarBoxToolbar = (function(superClass) {
  extend(ToolbarBoxToolbar, superClass);

  function ToolbarBoxToolbar() {
    return ToolbarBoxToolbar.__super__.constructor.apply(this, arguments);
  }

  ToolbarBoxToolbar.prototype.type = 'ToolbarBoxToolbar';

  ToolbarBoxToolbar.prototype.default_view = ToolbarBase.View;

  ToolbarBoxToolbar.prototype.initialize = function(options) {
    ToolbarBoxToolbar.__super__.initialize.call(this, options);
    this._init_tools();
    if (this.merge_tools === true) {
      return this._merge_tools();
    }
  };

  ToolbarBoxToolbar.define({
    merge_tools: [p.Bool, true]
  });

  ToolbarBoxToolbar.prototype._init_tools = function() {
    var et, i, len, ref, results, tool;
    ref = this.tools;
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      tool = ref[i];
      if (tool instanceof InspectTool.Model) {
        if (!_.some(this.inspectors, (function(_this) {
          return function(t) {
            return t.id === tool.id;
          };
        })(this))) {
          results.push(this.inspectors = this.inspectors.concat([tool]));
        } else {
          results.push(void 0);
        }
      } else if (tool instanceof HelpTool.Model) {
        if (!_.some(this.help, (function(_this) {
          return function(t) {
            return t.id === tool.id;
          };
        })(this))) {
          results.push(this.help = this.help.concat([tool]));
        } else {
          results.push(void 0);
        }
      } else if (tool instanceof ActionTool.Model) {
        if (!_.some(this.actions, (function(_this) {
          return function(t) {
            return t.id === tool.id;
          };
        })(this))) {
          results.push(this.actions = this.actions.concat([tool]));
        } else {
          results.push(void 0);
        }
      } else if (tool instanceof GestureTool.Model) {
        et = tool.event_type;
        if (!_.some(this.gestures[et].tools, (function(_this) {
          return function(t) {
            return t.id === tool.id;
          };
        })(this))) {
          results.push(this.gestures[et].tools = this.gestures[et].tools.concat([tool]));
        } else {
          results.push(void 0);
        }
      } else {
        results.push(void 0);
      }
    }
    return results;
  };

  ToolbarBoxToolbar.prototype._merge_tools = function() {
    var actions, active, et, event_type, gestures, helptool, i, info, inspectors, j, k, l, len, len1, len2, len3, make_proxy, new_help_tools, new_help_urls, proxy, ref, ref1, ref2, ref3, ref4, ref5, results, tool, tool_type, tools;
    inspectors = {};
    actions = {};
    gestures = {};
    new_help_tools = [];
    new_help_urls = [];
    ref = this.help;
    for (i = 0, len = ref.length; i < len; i++) {
      helptool = ref[i];
      if (!_.contains(new_help_urls, helptool.redirect)) {
        new_help_tools.push(helptool);
        new_help_urls.push(helptool.redirect);
      }
    }
    this.help = new_help_tools;
    ref1 = this.gestures;
    for (event_type in ref1) {
      info = ref1[event_type];
      if (!(event_type in gestures)) {
        gestures[event_type] = {};
      }
      ref2 = info.tools;
      for (j = 0, len1 = ref2.length; j < len1; j++) {
        tool = ref2[j];
        if (!(tool.type in gestures[event_type])) {
          gestures[event_type][tool.type] = [];
        }
        gestures[event_type][tool.type].push(tool);
      }
    }
    ref3 = this.inspectors;
    for (k = 0, len2 = ref3.length; k < len2; k++) {
      tool = ref3[k];
      if (!(tool.type in inspectors)) {
        inspectors[tool.type] = [];
      }
      inspectors[tool.type].push(tool);
    }
    ref4 = this.actions;
    for (l = 0, len3 = ref4.length; l < len3; l++) {
      tool = ref4[l];
      if (!(tool.type in actions)) {
        actions[tool.type] = [];
      }
      actions[tool.type].push(tool);
    }
    make_proxy = function(tools, active) {
      if (active == null) {
        active = false;
      }
      return new ToolProxy({
        tools: tools,
        event_type: tools[0].event_type,
        tooltip: tools[0].tool_name,
        tool_name: tools[0].tool_name,
        icon: tools[0].icon,
        active: active
      });
    };
    for (event_type in gestures) {
      this.gestures[event_type].tools = [];
      ref5 = gestures[event_type];
      for (tool_type in ref5) {
        tools = ref5[tool_type];
        if (tools.length > 0) {
          proxy = make_proxy(tools);
          this.gestures[event_type].tools.push(proxy);
          this.listenTo(proxy, 'change:active', _.bind(this._active_change, proxy));
        }
      }
    }
    this.actions = [];
    for (tool_type in actions) {
      tools = actions[tool_type];
      if (tools.length > 0) {
        this.actions.push(make_proxy(tools));
      }
    }
    this.inspectors = [];
    for (tool_type in inspectors) {
      tools = inspectors[tool_type];
      if (tools.length > 0) {
        this.inspectors.push(make_proxy(tools, active = true));
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
      if (et !== 'pinch' && et !== 'scroll') {
        results.push(this.gestures[et].tools[0].active = true);
      } else {
        results.push(void 0);
      }
    }
    return results;
  };

  return ToolbarBoxToolbar;

})(ToolbarBase.Model);

ToolbarBoxView = (function(superClass) {
  extend(ToolbarBoxView, superClass);

  function ToolbarBoxView() {
    return ToolbarBoxView.__super__.constructor.apply(this, arguments);
  }

  ToolbarBoxView.prototype.className = 'bk-toolbar-box';

  ToolbarBoxView.prototype.get_width = function() {
    if (this.model._horizontal === true) {
      return 30;
    } else {
      return null;
    }
  };

  ToolbarBoxView.prototype.get_height = function() {
    return 30;
  };

  return ToolbarBoxView;

})(Box.View);

ToolbarBox = (function(superClass) {
  extend(ToolbarBox, superClass);

  function ToolbarBox() {
    return ToolbarBox.__super__.constructor.apply(this, arguments);
  }

  ToolbarBox.prototype.type = 'ToolbarBox';

  ToolbarBox.prototype.default_view = ToolbarBoxView;

  ToolbarBox.prototype.initialize = function(options) {
    var ref;
    ToolbarBox.__super__.initialize.call(this, options);
    this._toolbar = new ToolbarBoxToolbar(options);
    if ((ref = this.toolbar_location) === 'left' || ref === 'right') {
      this._horizontal = true;
      return this._toolbar._sizeable = this._toolbar._width;
    } else {
      this._horizontal = false;
      return this._toolbar._sizeable = this._toolbar._height;
    }
  };

  ToolbarBox.prototype._doc_attached = function() {
    return this._toolbar.attach_document(this.document);
  };

  ToolbarBox.prototype.get_layoutable_children = function() {
    return [this._toolbar];
  };

  ToolbarBox.define({
    toolbar_location: [p.Location, "right"],
    merge_tools: [p.Bool, true],
    tools: [p.Any, []],
    logo: [p.String, "normal"]
  });

  return ToolbarBox;

})(Box.Model);

module.exports = {
  Model: ToolbarBox,
  View: ToolbarBoxView
};
