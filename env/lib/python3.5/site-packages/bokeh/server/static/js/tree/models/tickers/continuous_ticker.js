var ContinuousTicker, Ticker, _, p,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

Ticker = require("./ticker");

p = require("../../core/properties");

ContinuousTicker = (function(superClass) {
  extend(ContinuousTicker, superClass);

  function ContinuousTicker() {
    return ContinuousTicker.__super__.constructor.apply(this, arguments);
  }

  ContinuousTicker.prototype.type = 'ContinuousTicker';

  ContinuousTicker.define({
    num_minor_ticks: [p.Number, 5],
    desired_num_ticks: [p.Number, 6]
  });

  ContinuousTicker.prototype.get_interval = void 0;

  ContinuousTicker.prototype.get_min_interval = function() {
    return this.min_interval;
  };

  ContinuousTicker.prototype.get_max_interval = function() {
    var ref;
    return (ref = this.max_interval) != null ? ref : 2e308;
  };

  ContinuousTicker.prototype.get_ideal_interval = function(data_low, data_high, desired_n_ticks) {
    var data_range;
    data_range = data_high - data_low;
    return data_range / desired_n_ticks;
  };

  return ContinuousTicker;

})(Ticker.Model);

module.exports = {
  Model: ContinuousTicker
};
