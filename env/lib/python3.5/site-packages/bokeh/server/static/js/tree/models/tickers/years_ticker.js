var BasicTicker, ONE_YEAR, SingleIntervalTicker, YearsTicker, _, last_year_no_later_than, util,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

BasicTicker = require("./basic_ticker");

SingleIntervalTicker = require("./single_interval_ticker");

util = require("./util");

last_year_no_later_than = util.last_year_no_later_than;

ONE_YEAR = util.ONE_YEAR;

YearsTicker = (function(superClass) {
  extend(YearsTicker, superClass);

  function YearsTicker() {
    return YearsTicker.__super__.constructor.apply(this, arguments);
  }

  YearsTicker.prototype.type = 'YearsTicker';

  YearsTicker.prototype.initialize = function(attrs, options) {
    YearsTicker.__super__.initialize.call(this, attrs, options);
    this.interval = ONE_YEAR;
    return this.basic_ticker = new BasicTicker.Model({
      num_minor_ticks: 0
    });
  };

  YearsTicker.prototype.get_ticks_no_defaults = function(data_low, data_high, desired_n_ticks) {
    var all_ticks, end_year, start_year, ticks_in_range, year, years;
    start_year = last_year_no_later_than(new Date(data_low)).getUTCFullYear();
    end_year = last_year_no_later_than(new Date(data_high)).getUTCFullYear();
    years = this.basic_ticker.get_ticks_no_defaults(start_year, end_year, desired_n_ticks).major;
    all_ticks = (function() {
      var i, len, results;
      results = [];
      for (i = 0, len = years.length; i < len; i++) {
        year = years[i];
        results.push(Date.UTC(year, 0, 1));
      }
      return results;
    })();
    ticks_in_range = _.filter(all_ticks, (function(tick) {
      return (data_low <= tick && tick <= data_high);
    }));
    return {
      major: ticks_in_range,
      minor: []
    };
  };

  return YearsTicker;

})(SingleIntervalTicker.Model);

module.exports = {
  Model: YearsTicker
};
