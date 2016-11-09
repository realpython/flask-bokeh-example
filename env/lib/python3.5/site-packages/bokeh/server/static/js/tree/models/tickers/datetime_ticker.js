var AdaptiveTicker, CompositeTicker, DatetimeTicker, DaysTicker, MonthsTicker, ONE_HOUR, ONE_MILLI, ONE_MINUTE, ONE_MONTH, ONE_SECOND, YearsTicker, _, util,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

AdaptiveTicker = require("./adaptive_ticker");

CompositeTicker = require("./composite_ticker");

DaysTicker = require("./days_ticker");

MonthsTicker = require("./months_ticker");

YearsTicker = require("./years_ticker");

util = require("./util");

ONE_MILLI = util.ONE_MILLI;

ONE_SECOND = util.ONE_SECOND;

ONE_MINUTE = util.ONE_MINUTE;

ONE_HOUR = util.ONE_HOUR;

ONE_MONTH = util.ONE_MONTH;

DatetimeTicker = (function(superClass) {
  extend(DatetimeTicker, superClass);

  function DatetimeTicker() {
    return DatetimeTicker.__super__.constructor.apply(this, arguments);
  }

  DatetimeTicker.prototype.type = 'DatetimeTicker';

  DatetimeTicker.override({
    num_minor_ticks: 0,
    tickers: function() {
      return [
        new AdaptiveTicker.Model({
          mantissas: [1, 2, 5],
          base: 10,
          min_interval: 0,
          max_interval: 500 * ONE_MILLI,
          num_minor_ticks: 0
        }), new AdaptiveTicker.Model({
          mantissas: [1, 2, 5, 10, 15, 20, 30],
          base: 60,
          min_interval: ONE_SECOND,
          max_interval: 30 * ONE_MINUTE,
          num_minor_ticks: 0
        }), new AdaptiveTicker.Model({
          mantissas: [1, 2, 4, 6, 8, 12],
          base: 24.0,
          min_interval: ONE_HOUR,
          max_interval: 12 * ONE_HOUR,
          num_minor_ticks: 0
        }), new DaysTicker.Model({
          days: _.range(1, 32)
        }), new DaysTicker.Model({
          days: _.range(1, 31, 3)
        }), new DaysTicker.Model({
          days: [1, 8, 15, 22]
        }), new DaysTicker.Model({
          days: [1, 15]
        }), new MonthsTicker.Model({
          months: _.range(0, 12, 1)
        }), new MonthsTicker.Model({
          months: _.range(0, 12, 2)
        }), new MonthsTicker.Model({
          months: _.range(0, 12, 4)
        }), new MonthsTicker.Model({
          months: _.range(0, 12, 6)
        }), new YearsTicker.Model({})
      ];
    }
  });

  return DatetimeTicker;

})(CompositeTicker.Model);

module.exports = {
  Model: DatetimeTicker
};
