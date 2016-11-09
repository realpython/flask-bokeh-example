var ButtonTool, GestureTool, GestureToolButtonView, GestureToolView, _,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

ButtonTool = require("../button_tool");

GestureToolButtonView = (function(superClass) {
  extend(GestureToolButtonView, superClass);

  function GestureToolButtonView() {
    return GestureToolButtonView.__super__.constructor.apply(this, arguments);
  }

  GestureToolButtonView.prototype._clicked = function() {
    var active;
    active = this.model.active;
    return this.model.active = !active;
  };

  return GestureToolButtonView;

})(ButtonTool.ButtonView);

GestureToolView = (function(superClass) {
  extend(GestureToolView, superClass);

  function GestureToolView() {
    return GestureToolView.__super__.constructor.apply(this, arguments);
  }

  return GestureToolView;

})(ButtonTool.View);

GestureTool = (function(superClass) {
  extend(GestureTool, superClass);

  function GestureTool() {
    return GestureTool.__super__.constructor.apply(this, arguments);
  }

  GestureTool.prototype.event_type = null;

  GestureTool.prototype.default_order = null;

  return GestureTool;

})(ButtonTool.Model);

module.exports = {
  Model: GestureTool,
  View: GestureToolView,
  ButtonView: GestureToolButtonView
};
