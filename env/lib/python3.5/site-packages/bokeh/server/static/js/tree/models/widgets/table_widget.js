var TableWidget, Widget, _, p,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

Widget = require("./widget");

p = require("../../core/properties");

TableWidget = (function(superClass) {
  extend(TableWidget, superClass);

  function TableWidget() {
    return TableWidget.__super__.constructor.apply(this, arguments);
  }

  TableWidget.prototype.type = "TableWidget";

  TableWidget.define({
    source: [p.Instance]
  });

  return TableWidget;

})(Widget.Model);

module.exports = {
  Model: TableWidget
};
