var InputWidget, InputWidgetView, Widget, _, p,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

Widget = require("./widget");

p = require("../../core/properties");

InputWidgetView = (function(superClass) {
  extend(InputWidgetView, superClass);

  function InputWidgetView() {
    return InputWidgetView.__super__.constructor.apply(this, arguments);
  }

  InputWidgetView.prototype.render = function() {
    InputWidgetView.__super__.render.call(this);
    return this.$el.find('input').prop("disabled", this.model.disabled);
  };

  InputWidgetView.prototype.change_input = function() {
    var ref;
    return (ref = this.model.callback) != null ? ref.execute(this.model) : void 0;
  };

  return InputWidgetView;

})(Widget.View);

InputWidget = (function(superClass) {
  extend(InputWidget, superClass);

  function InputWidget() {
    return InputWidget.__super__.constructor.apply(this, arguments);
  }

  InputWidget.prototype.type = "InputWidget";

  InputWidget.prototype.default_view = InputWidgetView;

  InputWidget.define({
    callback: [p.Instance],
    title: [p.String, '']
  });

  return InputWidget;

})(Widget.Model);

module.exports = {
  Model: InputWidget,
  View: InputWidgetView
};
