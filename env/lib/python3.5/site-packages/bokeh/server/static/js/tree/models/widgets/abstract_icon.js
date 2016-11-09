var AbstractIcon, Widget, _,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

Widget = require("./widget");

AbstractIcon = (function(superClass) {
  extend(AbstractIcon, superClass);

  function AbstractIcon() {
    return AbstractIcon.__super__.constructor.apply(this, arguments);
  }

  AbstractIcon.prototype.type = "AbstractIcon";

  return AbstractIcon;

})(Widget.Model);

module.exports = {
  Model: AbstractIcon
};
