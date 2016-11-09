var AdaptiveTicker, ContinuousTicker, _, argmin, clamp, log, p,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

argmin = require("./util").argmin;

ContinuousTicker = require("./continuous_ticker");

p = require("../../core/properties");

clamp = function(x, min_val, max_val) {
  return Math.max(min_val, Math.min(max_val, x));
};

log = function(x, base) {
  if (base == null) {
    base = Math.E;
  }
  return Math.log(x) / Math.log(base);
};

AdaptiveTicker = (function(superClass) {
  extend(AdaptiveTicker, superClass);

  function AdaptiveTicker() {
    return AdaptiveTicker.__super__.constructor.apply(this, arguments);
  }

  AdaptiveTicker.prototype.type = 'AdaptiveTicker';

  AdaptiveTicker.define({
    base: [p.Number, 10.0],
    mantissas: [p.Array, [1, 2, 5]],
    min_interval: [p.Number, 0.0],
    max_interval: [p.Number]
  });

  AdaptiveTicker.prototype.initialize = function(attrs, options) {
    var prefix_mantissa, suffix_mantissa;
    AdaptiveTicker.__super__.initialize.call(this, attrs, options);
    prefix_mantissa = _.last(this.mantissas) / this.base;
    suffix_mantissa = _.first(this.mantissas) * this.base;
    this.extended_mantissas = _.flatten([prefix_mantissa, this.mantissas, suffix_mantissa]);
    return this.base_factor = this.get_min_interval() === 0.0 ? 1.0 : this.get_min_interval();
  };

  AdaptiveTicker.prototype.get_interval = function(data_low, data_high, desired_n_ticks) {
    var best_mantissa, candidate_mantissas, data_range, errors, ideal_interval, ideal_magnitude, ideal_mantissa, interval, interval_exponent;
    data_range = data_high - data_low;
    ideal_interval = this.get_ideal_interval(data_low, data_high, desired_n_ticks);
    interval_exponent = Math.floor(log(ideal_interval / this.base_factor, this.base));
    ideal_magnitude = Math.pow(this.base, interval_exponent) * this.base_factor;
    ideal_mantissa = ideal_interval / ideal_magnitude;
    candidate_mantissas = this.extended_mantissas;
    errors = candidate_mantissas.map(function(mantissa) {
      return Math.abs(desired_n_ticks - (data_range / (mantissa * ideal_magnitude)));
    });
    best_mantissa = candidate_mantissas[argmin(errors)];
    interval = best_mantissa * ideal_magnitude;
    return clamp(interval, this.get_min_interval(), this.get_max_interval());
  };

  return AdaptiveTicker;

})(ContinuousTicker.Model);

module.exports = {
  Model: AdaptiveTicker
};
