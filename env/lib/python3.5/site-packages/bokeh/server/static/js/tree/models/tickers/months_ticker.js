var MonthsTicker, ONE_MONTH, SingleIntervalTicker, _, copy_date, date_range_by_year, last_year_no_later_than, p, util,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

SingleIntervalTicker = require("./single_interval_ticker");

util = require("./util");

p = require("../../core/properties");

copy_date = util.copy_date;

last_year_no_later_than = util.last_year_no_later_than;

ONE_MONTH = util.ONE_MONTH;

date_range_by_year = function(start_time, end_time) {
  var date, dates, end_date, start_date;
  start_date = last_year_no_later_than(new Date(start_time));
  end_date = last_year_no_later_than(new Date(end_time));
  end_date.setUTCFullYear(end_date.getUTCFullYear() + 1);
  dates = [];
  date = start_date;
  while (true) {
    dates.push(copy_date(date));
    date.setUTCFullYear(date.getUTCFullYear() + 1);
    if (date > end_date) {
      break;
    }
  }
  return dates;
};

MonthsTicker = (function(superClass) {
  extend(MonthsTicker, superClass);

  function MonthsTicker() {
    return MonthsTicker.__super__.constructor.apply(this, arguments);
  }

  MonthsTicker.prototype.type = 'MonthsTicker';

  MonthsTicker.define({
    months: [p.Array, []]
  });

  MonthsTicker.prototype.initialize = function(attrs, options) {
    var interval, months;
    MonthsTicker.__super__.initialize.call(this, attrs, options);
    months = this.months;
    interval = months.length > 1 ? (months[1] - months[0]) * ONE_MONTH : 12 * ONE_MONTH;
    return this.interval = interval;
  };

  MonthsTicker.prototype.get_ticks_no_defaults = function(data_low, data_high, desired_n_ticks) {
    var all_ticks, date, month_dates, months, months_of_year, ticks_in_range, year_dates;
    year_dates = date_range_by_year(data_low, data_high);
    months = this.months;
    months_of_year = function(year_date) {
      return months.map(function(month) {
        var month_date;
        month_date = copy_date(year_date);
        month_date.setUTCMonth(month);
        return month_date;
      });
    };
    month_dates = _.flatten((function() {
      var i, len, results;
      results = [];
      for (i = 0, len = year_dates.length; i < len; i++) {
        date = year_dates[i];
        results.push(months_of_year(date));
      }
      return results;
    })());
    all_ticks = _.invoke(month_dates, 'getTime');
    ticks_in_range = _.filter(all_ticks, (function(tick) {
      return (data_low <= tick && tick <= data_high);
    }));
    return {
      "major": ticks_in_range,
      "minor": []
    };
  };

  return MonthsTicker;

})(SingleIntervalTicker.Model);

module.exports = {
  Model: MonthsTicker
};
