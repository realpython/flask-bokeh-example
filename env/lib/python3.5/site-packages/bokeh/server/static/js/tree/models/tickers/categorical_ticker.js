var CategoricalTicker, Ticker,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Ticker = require("./ticker");

CategoricalTicker = (function(superClass) {
  extend(CategoricalTicker, superClass);

  function CategoricalTicker() {
    return CategoricalTicker.__super__.constructor.apply(this, arguments);
  }

  CategoricalTicker.prototype.type = 'CategoricalTicker';

  CategoricalTicker.prototype.get_ticks = function(start, end, range, arg) {
    var desired_n_ticks, factors, i, ii, j, majors, ref;
    desired_n_ticks = arg.desired_n_ticks;
    majors = [];
    factors = range.factors;
    for (i = j = 0, ref = factors.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
      ii = i + range.offset;
      if ((ii + 1) > start && (ii + 1) < end) {
        majors.push(factors[i]);
      }
    }
    return {
      "major": majors,
      "minor": []
    };
  };

  return CategoricalTicker;

})(Ticker.Model);

module.exports = {
  Model: CategoricalTicker
};
