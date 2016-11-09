var DatetimeAxis, DatetimeAxisView, DatetimeTickFormatter, DatetimeTicker, LinearAxis, _,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

LinearAxis = require("./axis");

DatetimeTickFormatter = require("../formatters/datetime_tick_formatter");

DatetimeTicker = require("../tickers/datetime_ticker");

DatetimeAxisView = (function(superClass) {
  extend(DatetimeAxisView, superClass);

  function DatetimeAxisView() {
    return DatetimeAxisView.__super__.constructor.apply(this, arguments);
  }

  return DatetimeAxisView;

})(LinearAxis.View);

DatetimeAxis = (function(superClass) {
  extend(DatetimeAxis, superClass);

  function DatetimeAxis() {
    return DatetimeAxis.__super__.constructor.apply(this, arguments);
  }

  DatetimeAxis.prototype.default_view = DatetimeAxisView;

  DatetimeAxis.prototype.type = 'DatetimeAxis';

  DatetimeAxis.override({
    ticker: function() {
      return new DatetimeTicker.Model();
    },
    formatter: function() {
      return new DatetimeTickFormatter.Model();
    }
  });

  return DatetimeAxis;

})(LinearAxis.Model);

module.exports = {
  Model: DatetimeAxis,
  View: DatetimeAxisView
};
