var ColorMapper, LogColorMapper, _, log1p, p, ref,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

p = require("../../core/properties");

ColorMapper = require("./color_mapper");

log1p = (ref = Math.log1p) != null ? ref : function(x) {
  return Math.log(1 + x);
};

LogColorMapper = (function(superClass) {
  extend(LogColorMapper, superClass);

  function LogColorMapper() {
    return LogColorMapper.__super__.constructor.apply(this, arguments);
  }

  LogColorMapper.prototype.type = "LogColorMapper";

  LogColorMapper.define({
    high: [p.Number],
    low: [p.Number],
    high_color: [p.Color],
    low_color: [p.Color]
  });

  LogColorMapper.prototype._get_values = function(data, palette) {
    var d, high, i, key, len, log, low, max_key, n, ref1, ref2, scale, values;
    n = palette.length;
    low = (ref1 = this.low) != null ? ref1 : _.min(data);
    high = (ref2 = this.high) != null ? ref2 : _.max(data);
    scale = n / (log1p(high) - log1p(low));
    max_key = palette.length - 1;
    values = [];
    for (i = 0, len = data.length; i < len; i++) {
      d = data[i];
      if (isNaN(d)) {
        values.push(this.nan_color);
        continue;
      }
      if (d > high) {
        if (this.high_color != null) {
          values.push(this.high_color);
        } else {
          values.push(palette[max_key]);
        }
        continue;
      }
      if (d === high) {
        values.push(palette[max_key]);
        continue;
      }
      if (d < low) {
        if (this.low_color != null) {
          values.push(this.low_color);
        } else {
          values.push(palette[0]);
        }
        continue;
      }
      log = log1p(d) - log1p(low);
      key = Math.floor(log * scale);
      if (key > max_key) {
        key = max_key;
      }
      values.push(palette[key]);
    }
    return values;
  };

  return LogColorMapper;

})(ColorMapper.Model);

module.exports = {
  Model: LogColorMapper
};
