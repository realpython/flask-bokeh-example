var Glyph, Greys9, Image, ImageView, LinearColorMapper, _, p,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

Glyph = require("../glyphs/glyph");

LinearColorMapper = require("../mappers/linear_color_mapper");

p = require("../../core/properties");

ImageView = (function(superClass) {
  extend(ImageView, superClass);

  function ImageView() {
    return ImageView.__super__.constructor.apply(this, arguments);
  }

  ImageView.prototype.initialize = function(options) {
    ImageView.__super__.initialize.call(this, options);
    return this.listenTo(this.model.color_mapper, 'change', this._update_image);
  };

  ImageView.prototype._update_image = function() {
    if (this.image_data != null) {
      this._set_data();
      return this.renderer.plot_view.request_render();
    }
  };

  ImageView.prototype._index_data = function() {
    return this._xy_index();
  };

  ImageView.prototype._set_data = function() {
    var buf, buf8, canvas, cmap, ctx, i, image_data, img, j, ref, results;
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
    for (i = j = 0, ref = this._image.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
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
      cmap = this.model.color_mapper;
      if (this._rows != null) {
        img = this._image[i];
      } else {
        img = _.flatten(this._image[i]);
      }
      buf = cmap.v_map_screen(img);
      buf8 = new Uint8ClampedArray(buf);
      image_data.data.set(buf8);
      ctx.putImageData(image_data, 0, 0);
      this.image_data[i] = canvas;
      this.max_dw = 0;
      if (this._dw.units === "data") {
        this.max_dw = _.max(this._dw);
      }
      this.max_dh = 0;
      if (this._dh.units === "data") {
        this.max_dh = _.max(this._dh);
      }
      results.push(this._xy_index());
    }
    return results;
  };

  ImageView.prototype._map_data = function() {
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

  ImageView.prototype._render = function(ctx, indices, arg) {
    var i, image_data, j, len, old_smoothing, sh, sw, sx, sy, y_offset;
    image_data = arg.image_data, sx = arg.sx, sy = arg.sy, sw = arg.sw, sh = arg.sh;
    old_smoothing = ctx.getImageSmoothingEnabled();
    ctx.setImageSmoothingEnabled(false);
    for (j = 0, len = indices.length; j < len; j++) {
      i = indices[j];
      if (image_data[i] == null) {
        continue;
      }
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

  ImageView.prototype.bounds = function() {
    var d;
    d = this.index.data;
    return {
      minX: d.minX,
      minY: d.minY,
      maxX: d.maxX + this.max_dw,
      maxY: d.maxY + this.max_dh
    };
  };

  return ImageView;

})(Glyph.View);

Greys9 = function() {
  return [0x000000, 0x252525, 0x525252, 0x737373, 0x969696, 0xbdbdbd, 0xd9d9d9, 0xf0f0f0, 0xffffff];
};

Image = (function(superClass) {
  extend(Image, superClass);

  function Image() {
    return Image.__super__.constructor.apply(this, arguments);
  }

  Image.prototype.default_view = ImageView;

  Image.prototype.type = 'Image';

  Image.coords([['x', 'y']]);

  Image.mixins([]);

  Image.define({
    image: [p.NumberSpec],
    dw: [p.DistanceSpec],
    dh: [p.DistanceSpec],
    dilate: [p.Bool, false],
    color_mapper: [
      p.Instance, function() {
        return new LinearColorMapper.Model({
          palette: Greys9()
        });
      }
    ]
  });

  return Image;

})(Glyph.Model);

module.exports = {
  Model: Image,
  View: ImageView
};
