var Model, Ticker, _,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

Model = require("../../model");

Ticker = (function(superClass) {
  extend(Ticker, superClass);

  function Ticker() {
    return Ticker.__super__.constructor.apply(this, arguments);
  }

  Ticker.prototype.type = 'Ticker';

  Ticker.prototype.get_ticks = function(data_low, data_high, range, arg) {
    var desired_n_ticks;
    desired_n_ticks = arg.desired_n_ticks;
    return this.get_ticks_no_defaults(data_low, data_high, this.desired_num_ticks);
  };

  Ticker.prototype.get_ticks_no_defaults = function(data_low, data_high, desired_n_ticks) {
    var end_factor, factor, factors, i, interval, j, k, l, len, len1, len2, minor_interval, minor_offsets, minor_ticks, num_minor_ticks, start_factor, tick, ticks, x;
    interval = this.get_interval(data_low, data_high, desired_n_ticks);
    start_factor = Math.floor(data_low / interval);
    end_factor = Math.ceil(data_high / interval);
    if (_.isNaN(start_factor) || _.isNaN(end_factor)) {
      factors = [];
    } else {
      factors = _.range(start_factor, end_factor + 1);
    }
    ticks = (function() {
      var j, len, results;
      results = [];
      for (j = 0, len = factors.length; j < len; j++) {
        factor = factors[j];
        results.push(factor * interval);
      }
      return results;
    })();
    num_minor_ticks = this.num_minor_ticks;
    minor_ticks = [];
    if (num_minor_ticks > 1) {
      minor_interval = interval / num_minor_ticks;
      minor_offsets = (function() {
        var j, ref, results;
        results = [];
        for (i = j = 1, ref = num_minor_ticks; 1 <= ref ? j <= ref : j >= ref; i = 1 <= ref ? ++j : --j) {
          results.push(i * minor_interval);
        }
        return results;
      })();
      for (j = 0, len = minor_offsets.length; j < len; j++) {
        x = minor_offsets[j];
        minor_ticks.push(ticks[0] - x);
      }
      for (k = 0, len1 = ticks.length; k < len1; k++) {
        tick = ticks[k];
        for (l = 0, len2 = minor_offsets.length; l < len2; l++) {
          x = minor_offsets[l];
          minor_ticks.push(tick + x);
        }
      }
    }
    return {
      "major": ticks,
      "minor": minor_ticks
    };
  };

  return Ticker;

})(Model);

module.exports = {
  Model: Ticker
};
