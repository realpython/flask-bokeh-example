var ColorMapper, Model, _, p,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

p = require("../../core/properties");

Model = require("../../model");

ColorMapper = (function(superClass) {
  extend(ColorMapper, superClass);

  function ColorMapper() {
    return ColorMapper.__super__.constructor.apply(this, arguments);
  }

  ColorMapper.prototype.type = "ColorMapper";

  ColorMapper.define({
    palette: [p.Any],
    nan_color: [p.Color, "gray"]
  });

  ColorMapper.prototype.initialize = function(attrs, options) {
    ColorMapper.__super__.initialize.call(this, attrs, options);
    this._little_endian = this._is_little_endian();
    this._palette = this._build_palette(this.palette);
    return this.listenTo(this, 'change', function() {
      return this._palette = this._build_palette(this.palette);
    });
  };

  ColorMapper.prototype.v_map_screen = function(data) {
    var buf, color, i, j, k, ref, ref1, value, values;
    values = this._get_values(data, this._palette);
    buf = new ArrayBuffer(data.length * 4);
    color = new Uint32Array(buf);
    if (this._little_endian) {
      for (i = j = 0, ref = data.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
        value = values[i];
        color[i] = (0xff << 24) | ((value & 0xff0000) >> 16) | (value & 0xff00) | ((value & 0xff) << 16);
      }
    } else {
      for (i = k = 0, ref1 = data.length; 0 <= ref1 ? k < ref1 : k > ref1; i = 0 <= ref1 ? ++k : --k) {
        value = values[i];
        color[i] = (value << 8) | 0xff;
      }
    }
    return buf;
  };

  ColorMapper.prototype.compute = function(x) {
    return null;
  };

  ColorMapper.prototype.v_compute = function(xs) {
    var values;
    values = this._get_values(xs, this.palette);
    return values;
  };

  ColorMapper.prototype._get_values = function(data, palette) {
    return [];
  };

  ColorMapper.prototype._is_little_endian = function() {
    var buf, buf32, buf8, little_endian;
    buf = new ArrayBuffer(4);
    buf8 = new Uint8ClampedArray(buf);
    buf32 = new Uint32Array(buf);
    buf32[1] = 0x0a0b0c0d;
    little_endian = true;
    if (buf8[4] === 0x0a && buf8[5] === 0x0b && buf8[6] === 0x0c && buf8[7] === 0x0d) {
      little_endian = false;
    }
    return little_endian;
  };

  ColorMapper.prototype._build_palette = function(palette) {
    var _convert, i, j, new_palette, ref;
    new_palette = new Uint32Array(palette.length);
    _convert = function(value) {
      if (_.isNumber(value)) {
        return value;
      } else {
        return parseInt(value.slice(1), 16);
      }
    };
    for (i = j = 0, ref = palette.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
      new_palette[i] = _convert(palette[i]);
    }
    return new_palette;
  };

  return ColorMapper;

})(Model);

module.exports = {
  Model: ColorMapper
};
