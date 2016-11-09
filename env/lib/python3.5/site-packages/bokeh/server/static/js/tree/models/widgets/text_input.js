var InputWidget, TextInput, TextInputView, _, build_views, logger, p, template,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

build_views = require("../../core/build_views");

logger = require("../../core/logging").logger;

p = require("../../core/properties");

InputWidget = require("./input_widget");

template = require("./text_input_template");

TextInputView = (function(superClass) {
  extend(TextInputView, superClass);

  function TextInputView() {
    return TextInputView.__super__.constructor.apply(this, arguments);
  }

  TextInputView.prototype.tagName = "div";

  TextInputView.prototype.attributes = {
    "class": "bk-widget-form-group"
  };

  TextInputView.prototype.template = template;

  TextInputView.prototype.events = {
    "change input": "change_input"
  };

  TextInputView.prototype.initialize = function(options) {
    TextInputView.__super__.initialize.call(this, options);
    this.render();
    return this.listenTo(this.model, 'change', this.render);
  };

  TextInputView.prototype.render = function() {
    TextInputView.__super__.render.call(this);
    this.$el.html(this.template(this.model.attributes));
    if (this.model.height) {
      this.$el.find('input').height(this.model.height - 35);
    }
    return this;
  };

  TextInputView.prototype.change_input = function() {
    var value;
    value = this.$('input').val();
    logger.debug("widget/text_input: value = " + value);
    this.model.value = value;
    return TextInputView.__super__.change_input.call(this);
  };

  return TextInputView;

})(InputWidget.View);

TextInput = (function(superClass) {
  extend(TextInput, superClass);

  function TextInput() {
    return TextInput.__super__.constructor.apply(this, arguments);
  }

  TextInput.prototype.type = "TextInput";

  TextInput.prototype.default_view = TextInputView;

  TextInput.define({
    value: [p.String, ""]
  });

  return TextInput;

})(InputWidget.Model);

module.exports = {
  Model: TextInput,
  View: TextInputView
};
