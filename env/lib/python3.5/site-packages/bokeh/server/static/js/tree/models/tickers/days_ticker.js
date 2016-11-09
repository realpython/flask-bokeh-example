var DaysTicker, ONE_DAY, SingleIntervalTicker, _, copy_date, date_range_by_month, last_month_no_later_than, p, util,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

SingleIntervalTicker = require("./single_interval_ticker");

util = require("./util");

p = require("../../core/properties");

copy_date = util.copy_date;

last_month_no_later_than = util.last_month_no_later_than;

ONE_DAY = util.ONE_DAY;

date_range_by_month = function(start_time, end_time) {
  var date, dates, end_date, prev_end_date, start_date;
  start_date = last_month_no_later_than(new Date(start_time));
  end_date = last_month_no_later_than(new Date(end_time));
  prev_end_date = copy_date(end_date);
  end_date.setUTCMonth(end_date.getUTCMonth() + 1);
  dates = [];
  date = start_date;
  while (true) {
    dates.push(copy_date(date));
    date.setUTCMonth(date.getUTCMonth() + 1);
    if (date > end_date) {
      break;
    }
  }
  return dates;
};

DaysTicker = (function(superClass) {
  extend(DaysTicker, superClass);

  function DaysTicker() {
    return DaysTicker.__super__.constructor.apply(this, arguments);
  }

  DaysTicker.prototype.type = 'DaysTicker';

  DaysTicker.define({
    days: [p.Array, []]
  });

  DaysTicker.prototype.initialize = function(attrs, options) {
    var days, interval;
    attrs.num_minor_ticks = 0;
    DaysTicker.__super__.initialize.call(this, attrs, options);
    days = this.days;
    interval = days.length > 1 ? (days[1] - days[0]) * ONE_DAY : 31 * ONE_DAY;
    return this.interval = interval;
  };

  DaysTicker.prototype.get_ticks_no_defaults = function(data_low, data_high, desired_n_ticks) {
    var all_ticks, date, day_dates, days, days_of_month, interval, month_dates, ticks_in_range;
    month_dates = date_range_by_month(data_low, data_high);
    days = this.days;
    days_of_month = (function(_this) {
      return function(month_date, interval) {
        var dates, day, day_date, future_date, i, len;
        dates = [];
        for (i = 0, len = days.length; i < len; i++) {
          day = days[i];
          day_date = copy_date(month_date);
          day_date.setUTCDate(day);
          future_date = new Date(day_date.getTime() + (interval / 2));
          if (future_date.getUTCMonth() === month_date.getUTCMonth()) {
            dates.push(day_date);
          }
        }
        return dates;
      };
    })(this);
    interval = this.interval;
    day_dates = _.flatten((function() {
      var i, len, results;
      results = [];
      for (i = 0, len = month_dates.length; i < len; i++) {
        date = month_dates[i];
        results.push(days_of_month(date, interval));
      }
      return results;
    })());
    all_ticks = _.invoke(day_dates, 'getTime');
    ticks_in_range = _.filter(all_ticks, (function(tick) {
      return (data_low <= tick && tick <= data_high);
    }));
    return {
      "major": ticks_in_range,
      "minor": []
    };
  };

  return DaysTicker;

})(SingleIntervalTicker.Model);

module.exports = {
  Model: DaysTicker
};
