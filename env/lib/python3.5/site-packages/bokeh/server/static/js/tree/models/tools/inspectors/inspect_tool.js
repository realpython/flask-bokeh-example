var BokehView, InspectTool, InspectToolListItemView, InspectToolView, Tool, _, inspect_tool_list_item_template,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

BokehView = require("../../../core/bokeh_view");

Tool = require("../tool");

inspect_tool_list_item_template = require("./inspect_tool_list_item_template");

InspectToolListItemView = (function(superClass) {
  extend(InspectToolListItemView, superClass);

  function InspectToolListItemView() {
    return InspectToolListItemView.__super__.constructor.apply(this, arguments);
  }

  InspectToolListItemView.prototype.className = "bk-toolbar-inspector";

  InspectToolListItemView.prototype.template = inspect_tool_list_item_template;

  InspectToolListItemView.prototype.events = {
    'click [type="checkbox"]': '_clicked'
  };

  InspectToolListItemView.prototype.initialize = function(options) {
    this.listenTo(this.model, 'change:active', this.render);
    return this.render();
  };

  InspectToolListItemView.prototype.render = function() {
    this.$el.html(this.template({
      model: this.model
    }));
    return this;
  };

  InspectToolListItemView.prototype._clicked = function(e) {
    var active;
    active = this.model.active;
    return this.model.active = !active;
  };

  return InspectToolListItemView;

})(BokehView);

InspectToolView = (function(superClass) {
  extend(InspectToolView, superClass);

  function InspectToolView() {
    return InspectToolView.__super__.constructor.apply(this, arguments);
  }

  return InspectToolView;

})(Tool.View);

InspectTool = (function(superClass) {
  extend(InspectTool, superClass);

  function InspectTool() {
    return InspectTool.__super__.constructor.apply(this, arguments);
  }

  InspectTool.prototype.event_type = "move";

  InspectTool.override({
    active: true
  });

  InspectTool.prototype.bind_bokeh_events = function() {
    InspectTool.__super__.bind_bokeh_events.call(this);
    return this.listenTo(events, 'move', this._inspect);
  };

  InspectTool.prototype._inspect = function(vx, vy, e) {};

  InspectTool.prototype._exit_inner = function() {};

  InspectTool.prototype._exit_outer = function() {};

  return InspectTool;

})(Tool.Model);

module.exports = {
  Model: InspectTool,
  View: InspectToolView,
  ListItemView: InspectToolListItemView
};
