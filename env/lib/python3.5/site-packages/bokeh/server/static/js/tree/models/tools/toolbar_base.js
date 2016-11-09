var $, $$1, ActionTool, EQ, GestureTool, HelpTool, InspectTool, LayoutDOM, ToolbarBase, ToolbarBaseView, Variable, _, logger, p, ref, toolbar_template,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

_ = require("underscore");

$ = require("jquery");

$$1 = require("bootstrap/dropdown");

logger = require("../../core/logging").logger;

ref = require("../../core/layout/solver"), EQ = ref.EQ, Variable = ref.Variable;

p = require("../../core/properties");

LayoutDOM = require("../layouts/layout_dom");

ActionTool = require("./actions/action_tool");

HelpTool = require("./actions/help_tool");

GestureTool = require("./gestures/gesture_tool");

InspectTool = require("./inspectors/inspect_tool");

toolbar_template = require("./toolbar_template");

ToolbarBaseView = (function(superClass) {
  extend(ToolbarBaseView, superClass);

  function ToolbarBaseView() {
    return ToolbarBaseView.__super__.constructor.apply(this, arguments);
  }

  ToolbarBaseView.prototype.className = "bk-toolbar-wrapper";

  ToolbarBaseView.prototype.template = toolbar_template;

  ToolbarBaseView.prototype.render = function() {
    var anchor, button_bar_list, et, gestures, inspectors, location, sticky, ul;
    if (this.model.sizing_mode !== 'fixed') {
      this.$el.css({
        left: this.model._dom_left._value,
        top: this.model._dom_top._value,
        'width': this.model._width._value,
        'height': this.model._height._value
      });
    }
    location = this.model.toolbar_location != null ? this.model.toolbar_location : 'above';
    sticky = this.model.toolbar_sticky === true ? 'sticky' : 'not-sticky';
    this.$el.html(this.template({
      logo: this.model.logo,
      location: location,
      sticky: sticky
    }));
    inspectors = this.model.inspectors;
    button_bar_list = this.$(".bk-bs-dropdown[type='inspectors']");
    if (inspectors.length === 0) {
      button_bar_list.hide();
    } else {
      anchor = $('<a href="#" data-bk-bs-toggle="dropdown" class="bk-bs-dropdown-toggle">inspect <span class="bk-bs-caret"></a>');
      anchor.appendTo(button_bar_list);
      ul = $('<ul class="bk-bs-dropdown-menu" />');
      _.each(inspectors, function(tool) {
        var item;
        item = $('<li />');
        item.append(new InspectTool.ListItemView({
          model: tool
        }).el);
        return item.appendTo(ul);
      });
      ul.on('click', function(e) {
        return e.stopPropagation();
      });
      ul.appendTo(button_bar_list);
      anchor.dropdown();
    }
    button_bar_list = this.$(".bk-button-bar-list[type='help']");
    _.each(this.model.help, function(item) {
      return button_bar_list.append(new ActionTool.ButtonView({
        model: item
      }).el);
    });
    button_bar_list = this.$(".bk-button-bar-list[type='actions']");
    _.each(this.model.actions, function(item) {
      return button_bar_list.append(new ActionTool.ButtonView({
        model: item
      }).el);
    });
    gestures = this.model.gestures;
    for (et in gestures) {
      button_bar_list = this.$(".bk-button-bar-list[type='" + et + "']");
      _.each(gestures[et].tools, function(item) {
        return button_bar_list.append(new GestureTool.ButtonView({
          model: item
        }).el);
      });
    }
    return this;
  };

  return ToolbarBaseView;

})(LayoutDOM.View);

ToolbarBase = (function(superClass) {
  extend(ToolbarBase, superClass);

  function ToolbarBase() {
    this._active_change = bind(this._active_change, this);
    return ToolbarBase.__super__.constructor.apply(this, arguments);
  }

  ToolbarBase.prototype.type = 'ToolbarBase';

  ToolbarBase.prototype.default_view = ToolbarBaseView;

  ToolbarBase.prototype._active_change = function(tool) {
    var currently_active_tool, event_type, gestures;
    event_type = tool.event_type;
    gestures = this.gestures;
    currently_active_tool = gestures[event_type].active;
    if ((currently_active_tool != null) && currently_active_tool !== tool) {
      logger.debug("Toolbar: deactivating tool: " + currently_active_tool.type + " (" + currently_active_tool.id + ") for event type '" + event_type + "'");
      currently_active_tool.active = false;
    }
    gestures[event_type].active = tool;
    this.gestures = gestures;
    logger.debug("Toolbar: activating tool: " + tool.type + " (" + tool.id + ") for event type '" + event_type + "'");
    return null;
  };

  ToolbarBase.prototype.get_constraints = function() {
    var constraints;
    constraints = ToolbarBase.__super__.get_constraints.call(this);
    constraints.push(EQ(this._sizeable, -30));
    return constraints;
  };

  ToolbarBase.define({
    tools: [p.Array, []],
    logo: [p.String, 'normal']
  });

  ToolbarBase.internal({
    gestures: [
      p.Any, function() {
        return {
          pan: {
            tools: [],
            active: null
          },
          tap: {
            tools: [],
            active: null
          },
          doubletap: {
            tools: [],
            active: null
          },
          scroll: {
            tools: [],
            active: null
          },
          pinch: {
            tools: [],
            active: null
          },
          press: {
            tools: [],
            active: null
          },
          rotate: {
            tools: [],
            active: null
          }
        };
      }
    ],
    actions: [p.Array, []],
    inspectors: [p.Array, []],
    help: [p.Array, []],
    toolbar_location: [p.Location, 'right'],
    toolbar_sticky: [p.Bool]
  });

  ToolbarBase.override({
    sizing_mode: null
  });

  return ToolbarBase;

})(LayoutDOM.Model);

module.exports = {
  Model: ToolbarBase,
  View: ToolbarBaseView
};
