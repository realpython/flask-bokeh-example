var LayoutDOM, Widget, WidgetView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

LayoutDOM = require("../layouts/layout_dom");

WidgetView = (function(superClass) {
  extend(WidgetView, superClass);

  function WidgetView() {
    return WidgetView.__super__.constructor.apply(this, arguments);
  }

  WidgetView.prototype.className = "bk-widget";

  WidgetView.prototype.render = function() {
    if (this.model.height) {
      this.$el.height(this.model.height);
    }
    if (this.model.width) {
      return this.$el.width(this.model.width);
    }
  };

  return WidgetView;

})(LayoutDOM.View);

Widget = (function(superClass) {
  extend(Widget, superClass);

  function Widget() {
    return Widget.__super__.constructor.apply(this, arguments);
  }

  Widget.prototype.type = "Widget";

  Widget.prototype.default_view = WidgetView;

  return Widget;

})(LayoutDOM.Model);

module.exports = {
  Model: Widget,
  View: WidgetView
};
