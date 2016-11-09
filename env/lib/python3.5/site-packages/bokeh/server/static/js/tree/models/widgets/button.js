var AbstractButton, Button, ButtonView, _, p,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

p = require("../../core/properties");

AbstractButton = require("./abstract_button");

ButtonView = (function(superClass) {
  extend(ButtonView, superClass);

  function ButtonView() {
    return ButtonView.__super__.constructor.apply(this, arguments);
  }

  ButtonView.prototype.change_input = function() {
    this.model.clicks = this.model.clicks + 1;
    return ButtonView.__super__.change_input.call(this);
  };

  return ButtonView;

})(AbstractButton.View);

Button = (function(superClass) {
  extend(Button, superClass);

  function Button() {
    return Button.__super__.constructor.apply(this, arguments);
  }

  Button.prototype.type = "Button";

  Button.prototype.default_view = ButtonView;

  Button.define({
    clicks: [p.Number, 0]
  });

  return Button;

})(AbstractButton.Model);

module.exports = {
  Model: Button,
  View: ButtonView
};
