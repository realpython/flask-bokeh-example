var ColorMapper, LinearColorMapper, _, p,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

p = require("../../core/properties");

ColorMapper = require("./color_mapper");

LinearColorMapper = (function(superClass) {
  extend(LinearColorMapper, superClass);

  function LinearColorMapper() {
    return LinearColorMapper.__super__.constructor.apply(this, arguments);
  }

  LinearColorMapper.prototype.type = "LinearColorMapper";

  LinearColorMapper.define({
    high: [p.Number],
    low: [p.Number],
    high_color: [p.Color],
    low_color: [p.Color]
  });

  LinearColorMapper.prototype._get_values = function(data, palette) {
    var d, high, i, key, len, low, max_key, norm_factor, normed_d, normed_interval, ref, ref1, values;
    low = (ref = this.low) != null ? ref : _.min(data);
    high = (ref1 = this.high) != null ? ref1 : _.max(data);
    max_key = palette.length - 1;
    values = [];
    norm_factor = 1 / (high - low);
    normed_interval = 1 / palette.length;
    for (i = 0, len = data.length; i < len; i++) {
      d = data[i];
      if (isNaN(d)) {
        values.push(this.nan_color);
        continue;
      }
      if (d === high) {
        values.push(palette[max_key]);
        continue;
      }
      normed_d = (d - low) * norm_factor;
      key = Math.floor(normed_d / normed_interval);
      if (key < 0) {
        if (this.low_color != null) {
          values.push(this.low_color);
        } else {
          values.push(palette[0]);
        }
      } else if (key > max_key) {
        if (this.high_color != null) {
          values.push(this.high_color);
        } else {
          values.push(palette[max_key]);
        }
      } else {
        values.push(palette[key]);
      }
    }
    return values;
  };

  return LinearColorMapper;

})(ColorMapper.Model);

module.exports = {
  Model: LinearColorMapper
};
