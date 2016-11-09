var BokehView, ButtonTool, ButtonToolButtonView, ButtonToolView, Tool, _, button_tool_template, p,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

BokehView = require("../../core/bokeh_view");

Tool = require("./tool");

button_tool_template = require("./button_tool_template");

p = require("../../core/properties");

ButtonToolButtonView = (function(superClass) {
  extend(ButtonToolButtonView, superClass);

  function ButtonToolButtonView() {
    return ButtonToolButtonView.__super__.constructor.apply(this, arguments);
  }

  ButtonToolButtonView.prototype.tagName = "li";

  ButtonToolButtonView.prototype.template = button_tool_template;

  ButtonToolButtonView.prototype.events = function() {
    return {
      'click .bk-toolbar-button': '_clicked'
    };
  };

  ButtonToolButtonView.prototype.initialize = function(options) {
    ButtonToolButtonView.__super__.initialize.call(this, options);
    this.$el.html(this.template({
      model: this.model
    }));
    this.listenTo(this.model, 'change:active', (function(_this) {
      return function() {
        return _this.render();
      };
    })(this));
    this.listenTo(this.model, 'change:disabled', (function(_this) {
      return function() {
        return _this.render();
      };
    })(this));
    return this.render();
  };

  ButtonToolButtonView.prototype.render = function() {
    this.$el.children('button').prop("disabled", this.model.disabled).toggleClass('active', this.model.active);
    return this;
  };

  ButtonToolButtonView.prototype._clicked = function(e) {};

  return ButtonToolButtonView;

})(BokehView);

ButtonToolView = (function(superClass) {
  extend(ButtonToolView, superClass);

  function ButtonToolView() {
    return ButtonToolView.__super__.constructor.apply(this, arguments);
  }

  return ButtonToolView;

})(Tool.View);

ButtonTool = (function(superClass) {
  extend(ButtonTool, superClass);

  function ButtonTool() {
    return ButtonTool.__super__.constructor.apply(this, arguments);
  }

  ButtonTool.prototype.icon = null;

  ButtonTool.getters({
    tooltip: function() {
      return this.tool_name;
    }
  });

  ButtonTool.internal({
    disabled: [p.Boolean, false]
  });

  return ButtonTool;

})(Tool.Model);

module.exports = {
  Model: ButtonTool,
  View: ButtonToolView,
  ButtonView: ButtonToolButtonView
};
