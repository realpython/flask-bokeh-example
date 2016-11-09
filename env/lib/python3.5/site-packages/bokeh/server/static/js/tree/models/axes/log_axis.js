var Axis, ContinuousAxis, LogAxis, LogAxisView, LogTickFormatter, LogTicker, _,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

Axis = require("./axis");

ContinuousAxis = require("./continuous_axis");

LogTickFormatter = require("../formatters/log_tick_formatter");

LogTicker = require("../tickers/log_ticker");

LogAxisView = (function(superClass) {
  extend(LogAxisView, superClass);

  function LogAxisView() {
    return LogAxisView.__super__.constructor.apply(this, arguments);
  }

  return LogAxisView;

})(Axis.View);

LogAxis = (function(superClass) {
  extend(LogAxis, superClass);

  function LogAxis() {
    return LogAxis.__super__.constructor.apply(this, arguments);
  }

  LogAxis.prototype.default_view = LogAxisView;

  LogAxis.prototype.type = 'LogAxis';

  LogAxis.override({
    ticker: function() {
      return new LogTicker.Model();
    },
    formatter: function() {
      return new LogTickFormatter.Model();
    }
  });

  return LogAxis;

})(ContinuousAxis.Model);

module.exports = {
  Model: LogAxis,
  View: LogAxisView
};
