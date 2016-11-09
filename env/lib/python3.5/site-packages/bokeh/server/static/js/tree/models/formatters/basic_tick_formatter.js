var BasicTickFormatter, TickFormatter, _, p,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

TickFormatter = require("./tick_formatter");

p = require("../../core/properties");

BasicTickFormatter = (function(superClass) {
  extend(BasicTickFormatter, superClass);

  function BasicTickFormatter() {
    return BasicTickFormatter.__super__.constructor.apply(this, arguments);
  }

  BasicTickFormatter.prototype.type = 'BasicTickFormatter';

  BasicTickFormatter.define({
    precision: [p.Any, 'auto'],
    use_scientific: [p.Bool, true],
    power_limit_high: [p.Number, 5],
    power_limit_low: [p.Number, -3]
  });

  BasicTickFormatter.getters({
    scientific_limit_low: function() {
      return Math.pow(10.0, this.power_limit_low);
    },
    scientific_limit_high: function() {
      return Math.pow(10.0, this.power_limit_high);
    }
  });

  BasicTickFormatter.prototype.initialize = function(attrs, options) {
    BasicTickFormatter.__super__.initialize.call(this, attrs, options);
    return this.last_precision = 3;
  };

  BasicTickFormatter.prototype.doFormat = function(ticks) {
    var i, is_ok, j, k, l, labels, len, m, n, need_sci, o, precision, ref, ref1, ref2, ref3, ref4, tick, tick_abs, x, zero_eps;
    if (ticks.length === 0) {
      return [];
    }
    zero_eps = 0;
    if (ticks.length >= 2) {
      zero_eps = Math.abs(ticks[1] - ticks[0]) / 10000;
    }
    need_sci = false;
    if (this.use_scientific) {
      for (j = 0, len = ticks.length; j < len; j++) {
        tick = ticks[j];
        tick_abs = Math.abs(tick);
        if (tick_abs > zero_eps && (tick_abs >= this.scientific_limit_high || tick_abs <= this.scientific_limit_low)) {
          need_sci = true;
          break;
        }
      }
    }
    precision = this.precision;
    if ((precision == null) || _.isNumber(precision)) {
      labels = new Array(ticks.length);
      if (need_sci) {
        for (i = k = 0, ref = ticks.length; 0 <= ref ? k < ref : k > ref; i = 0 <= ref ? ++k : --k) {
          labels[i] = ticks[i].toExponential(precision || void 0);
        }
      } else {
        for (i = l = 0, ref1 = ticks.length; 0 <= ref1 ? l < ref1 : l > ref1; i = 0 <= ref1 ? ++l : --l) {
          labels[i] = ticks[i].toFixed(precision || void 0).replace(/(\.[0-9]*?)0+$/, "$1").replace(/\.$/, "");
        }
      }
      return labels;
    } else if (precision === 'auto') {
      labels = new Array(ticks.length);
      for (x = m = ref2 = this.last_precision; ref2 <= 15 ? m <= 15 : m >= 15; x = ref2 <= 15 ? ++m : --m) {
        is_ok = true;
        if (need_sci) {
          for (i = n = 0, ref3 = ticks.length; 0 <= ref3 ? n < ref3 : n > ref3; i = 0 <= ref3 ? ++n : --n) {
            labels[i] = ticks[i].toExponential(x);
            if (i > 0) {
              if (labels[i] === labels[i - 1]) {
                is_ok = false;
                break;
              }
            }
          }
          if (is_ok) {
            break;
          }
        } else {
          for (i = o = 0, ref4 = ticks.length; 0 <= ref4 ? o < ref4 : o > ref4; i = 0 <= ref4 ? ++o : --o) {
            labels[i] = ticks[i].toFixed(x).replace(/(\.[0-9]*?)0+$/, "$1").replace(/\.$/, "");
            if (i > 0) {
              if (labels[i] === labels[i - 1]) {
                is_ok = false;
                break;
              }
            }
          }
          if (is_ok) {
            break;
          }
        }
        if (is_ok) {
          this.last_precision = x;
          return labels;
        }
      }
    }
    return labels;
  };

  return BasicTickFormatter;

})(TickFormatter.Model);

module.exports = {
  Model: BasicTickFormatter
};
