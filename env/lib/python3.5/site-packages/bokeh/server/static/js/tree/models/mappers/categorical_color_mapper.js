var CategoricalColorMapper, ColorMapper, _, p,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

p = require("../../core/properties");

ColorMapper = require("./color_mapper");

CategoricalColorMapper = (function(superClass) {
  extend(CategoricalColorMapper, superClass);

  function CategoricalColorMapper() {
    return CategoricalColorMapper.__super__.constructor.apply(this, arguments);
  }

  CategoricalColorMapper.prototype.type = "CategoricalColorMapper";

  CategoricalColorMapper.define({
    factors: [p.Array]
  });

  CategoricalColorMapper.prototype._get_values = function(data, palette) {
    var color, d, i, key, len, values;
    values = [];
    for (i = 0, len = data.length; i < len; i++) {
      d = data[i];
      key = this.factors.indexOf(d);
      if (key < 0 || key >= palette.length) {
        color = this.nan_color;
      } else {
        color = palette[key];
      }
      values.push(color);
    }
    return values;
  };

  return CategoricalColorMapper;

})(ColorMapper.Model);

module.exports = {
  Model: CategoricalColorMapper
};
