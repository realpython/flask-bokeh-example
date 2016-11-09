var Glyph, ImageRGBA, ImageRGBAView, _, p,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

Glyph = require("./glyph");

p = require("../../core/properties");

ImageRGBAView = (function(superClass) {
  extend(ImageRGBAView, superClass);

  function ImageRGBAView() {
    return ImageRGBAView.__super__.constructor.apply(this, arguments);
  }

  ImageRGBAView.prototype._index_data = function() {
    return this._xy_index();
  };

  ImageRGBAView.prototype._set_data = function(source, arg) {
    var buf, buf8, canvas, color, ctx, flat, i, image_data, j, k, l, ref, ref1, results;
    if ((this.image_data == null) || this.image_data.length !== this._image.length) {
      this.image_data = new Array(this._image.length);
    }
    if ((this._width == null) || this._width.length !== this._image.length) {
      this._width = new Array(this._image.length);
    }
    if ((this._height == null) || this._height.length !== this._image.length) {
      this._height = new Array(this._image.length);
    }
    results = [];
    for (i = k = 0, ref = this._image.length; 0 <= ref ? k < ref : k > ref; i = 0 <= ref ? ++k : --k) {
      if (arg != null) {
        if (i !== arg) {
          continue;
        }
      }
      if (this._rows != null) {
        this._height[i] = this._rows[i];
        this._width[i] = this._cols[i];
      } else {
        this._height[i] = this._image[i].length;
        this._width[i] = this._image[i][0].length;
      }
      canvas = document.createElement('canvas');
      canvas.width = this._width[i];
      canvas.height = this._height[i];
      ctx = canvas.getContext('2d');
      image_data = ctx.getImageData(0, 0, this._width[i], this._height[i]);
      if (this._rows != null) {
        image_data.data.set(new Uint8ClampedArray(this._image[i]));
      } else {
        flat = _.flatten(this._image[i]);
        buf = new ArrayBuffer(flat.length * 4);
        color = new Uint32Array(buf);
        for (j = l = 0, ref1 = flat.length; 0 <= ref1 ? l < ref1 : l > ref1; j = 0 <= ref1 ? ++l : --l) {
          color[j] = flat[j];
        }
        buf8 = new Uint8ClampedArray(buf);
        image_data.data.set(buf8);
      }
      ctx.putImageData(image_data, 0, 0);
      this.image_data[i] = canvas;
      this.max_dw = 0;
      if (this._dw.units === "data") {
        this.max_dw = _.max(this._dw);
      }
      this.max_dh = 0;
      if (this._dh.units === "data") {
        results.push(this.max_dh = _.max(this._dh));
      } else {
        results.push(void 0);
      }
    }
    return results;
  };

  ImageRGBAView.prototype._map_data = function() {
    switch (this.model.properties.dw.units) {
      case "data":
        this.sw = this.sdist(this.renderer.xmapper, this._x, this._dw, 'edge', this.model.dilate);
        break;
      case "screen":
        this.sw = this._dw;
    }
    switch (this.model.properties.dh.units) {
      case "data":
        return this.sh = this.sdist(this.renderer.ymapper, this._y, this._dh, 'edge', this.model.dilate);
      case "screen":
        return this.sh = this._dh;
    }
  };

  ImageRGBAView.prototype._render = function(ctx, indices, arg1) {
    var i, image_data, k, len, old_smoothing, sh, sw, sx, sy, y_offset;
    image_data = arg1.image_data, sx = arg1.sx, sy = arg1.sy, sw = arg1.sw, sh = arg1.sh;
    old_smoothing = ctx.getImageSmoothingEnabled();
    ctx.setImageSmoothingEnabled(false);
    for (k = 0, len = indices.length; k < len; k++) {
      i = indices[k];
      if (isNaN(sx[i] + sy[i] + sw[i] + sh[i])) {
        continue;
      }
      y_offset = sy[i];
      ctx.translate(0, y_offset);
      ctx.scale(1, -1);
      ctx.translate(0, -y_offset);
      ctx.drawImage(image_data[i], sx[i] | 0, sy[i] | 0, sw[i], sh[i]);
      ctx.translate(0, y_offset);
      ctx.scale(1, -1);
      ctx.translate(0, -y_offset);
    }
    return ctx.setImageSmoothingEnabled(old_smoothing);
  };

  ImageRGBAView.prototype.bounds = function() {
    var d;
    d = this.index.data;
    return {
      minX: d.minX,
      minY: d.minY,
      maxX: d.maxX + this.max_dw,
      maxY: d.maxY + this.max_dh
    };
  };

  return ImageRGBAView;

})(Glyph.View);

ImageRGBA = (function(superClass) {
  extend(ImageRGBA, superClass);

  function ImageRGBA() {
    return ImageRGBA.__super__.constructor.apply(this, arguments);
  }

  ImageRGBA.prototype.default_view = ImageRGBAView;

  ImageRGBA.prototype.type = 'ImageRGBA';

  ImageRGBA.coords([['x', 'y']]);

  ImageRGBA.mixins([]);

  ImageRGBA.define({
    image: [p.NumberSpec],
    rows: [p.NumberSpec],
    cols: [p.NumberSpec],
    dw: [p.DistanceSpec],
    dh: [p.DistanceSpec],
    dilate: [p.Bool, false]
  });

  ImageRGBA.prototype.initialize = function(attrs, options) {
    ImageRGBA.__super__.initialize.call(this, attrs, options);
    this.properties.rows.optional = true;
    return this.properties.cols.optional = true;
  };

  return ImageRGBA;

})(Glyph.Model);

module.exports = {
  Model: ImageRGBA,
  View: ImageRGBAView
};
