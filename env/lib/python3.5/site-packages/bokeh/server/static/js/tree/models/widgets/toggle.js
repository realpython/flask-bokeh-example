var AbstractButton, Toggle, ToggleView, p,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

p = require("../../core/properties");

AbstractButton = require("./abstract_button");

ToggleView = (function(superClass) {
  extend(ToggleView, superClass);

  function ToggleView() {
    return ToggleView.__super__.constructor.apply(this, arguments);
  }

  ToggleView.prototype.render = function() {
    ToggleView.__super__.render.call(this);
    if (this.model.active) {
      this.$el.find('button').addClass("bk-bs-active");
    } else {
      this.$el.find('button').removeClass("bk-bs-active");
    }
    return this;
  };

  ToggleView.prototype.change_input = function() {
    ToggleView.__super__.change_input.call(this);
    return this.model.active = !this.model.active;
  };

  return ToggleView;

})(AbstractButton.View);

Toggle = (function(superClass) {
  extend(Toggle, superClass);

  function Toggle() {
    return Toggle.__super__.constructor.apply(this, arguments);
  }

  Toggle.prototype.type = "Toggle";

  Toggle.prototype.default_view = ToggleView;

  Toggle.define({
    active: [p.Bool, false]
  });

  Toggle.override({
    label: "Toggle"
  });

  return Toggle;

})(AbstractButton.Model);

module.exports = {
  Model: Toggle,
  View: ToggleView
};
