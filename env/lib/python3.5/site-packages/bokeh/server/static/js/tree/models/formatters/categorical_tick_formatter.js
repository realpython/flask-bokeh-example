var CategoricalTickFormatter, TickFormatter,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

TickFormatter = require("../formatters/tick_formatter");

CategoricalTickFormatter = (function(superClass) {
  extend(CategoricalTickFormatter, superClass);

  function CategoricalTickFormatter() {
    return CategoricalTickFormatter.__super__.constructor.apply(this, arguments);
  }

  CategoricalTickFormatter.prototype.type = 'CategoricalTickFormatter';

  CategoricalTickFormatter.prototype.doFormat = function(ticks) {
    return ticks;
  };

  return CategoricalTickFormatter;

})(TickFormatter.Model);

module.exports = {
  Model: CategoricalTickFormatter
};
