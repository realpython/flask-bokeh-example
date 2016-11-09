var Glyph, ImageURL, ImageURLView, _, logger, p,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

Glyph = require("./glyph");

logger = require("../../core/logging").logger;

p = require("../../core/properties");

ImageURLView = (function(superClass) {
  extend(ImageURLView, superClass);

  function ImageURLView() {
    return ImageURLView.__super__.constructor.apply(this, arguments);
  }

  ImageURLView.prototype.initialize = function(options) {
    ImageURLView.__super__.initialize.call(this, options);
    return this.listenTo(this.model, 'change:global_alpha', this.renderer.request_render);
  };

  ImageURLView.prototype._index_data = function() {};

  ImageURLView.prototype._set_data = function() {
    var i, img, j, ref, results, retry_attempts, retry_timeout;
    if ((this.image == null) || this.image.length !== this._url.length) {
      this.image = (function() {
        var j, len, ref, results;
        ref = this._url;
        results = [];
        for (j = 0, len = ref.length; j < len; j++) {
          img = ref[j];
          results.push(null);
        }
        return results;
      }).call(this);
    }
    retry_attempts = this.model.retry_attempts;
    retry_timeout = this.model.retry_timeout;
    this.retries = (function() {
      var j, len, ref, results;
      ref = this._url;
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        img = ref[j];
        results.push(retry_attempts);
      }
      return results;
    }).call(this);
    results = [];
    for (i = j = 0, ref = this._url.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
      if (this._url[i] == null) {
        continue;
      }
      img = new Image();
      img.onerror = (function(_this) {
        return function(i, img) {
          return function() {
            if (_this.retries[i] > 0) {
              logger.trace("ImageURL failed to load " + _this._url[i] + " image, retrying in " + retry_timeout + " ms");
              setTimeout((function() {
                return img.src = _this._url[i];
              }), retry_timeout);
            } else {
              logger.warn("ImageURL unable to load " + _this._url[i] + " image after " + retry_attempts + " retries");
            }
            return _this.retries[i] -= 1;
          };
        };
      })(this)(i, img);
      img.onload = (function(_this) {
        return function(img, i) {
          return function() {
            _this.image[i] = img;
            return _this.renderer.request_render();
          };
        };
      })(this)(img, i);
      results.push(img.src = this._url[i]);
    }
    return results;
  };

  ImageURLView.prototype._map_data = function() {
    var hs, ws, x;
    ws = ((function() {
      var j, len, ref, results;
      if (this._w != null) {
        return this._w;
      } else {
        ref = this._x;
        results = [];
        for (j = 0, len = ref.length; j < len; j++) {
          x = ref[j];
          results.push(0/0);
        }
        return results;
      }
    }).call(this));
    hs = ((function() {
      var j, len, ref, results;
      if (this._h != null) {
        return this._h;
      } else {
        ref = this._x;
        results = [];
        for (j = 0, len = ref.length; j < len; j++) {
          x = ref[j];
          results.push(0/0);
        }
        return results;
      }
    }).call(this));
    switch (this.model.properties.w.units) {
      case "data":
        this.sw = this.sdist(this.renderer.xmapper, this._x, ws, 'edge', this.model.dilate);
        break;
      case "screen":
        this.sw = ws;
    }
    switch (this.model.properties.h.units) {
      case "data":
        return this.sh = this.sdist(this.renderer.ymapper, this._y, hs, 'edge', this.model.dilate);
      case "screen":
        return this.sh = hs;
    }
  };

  ImageURLView.prototype._render = function(ctx, indices, arg) {
    var _angle, _url, frame, i, image, j, len, results, sh, sw, sx, sy;
    _url = arg._url, image = arg.image, sx = arg.sx, sy = arg.sy, sw = arg.sw, sh = arg.sh, _angle = arg._angle;
    frame = this.renderer.plot_view.frame;
    ctx.rect(frame.left + 1, frame.bottom + 1, frame.width - 2, frame.height - 2);
    ctx.clip();
    results = [];
    for (j = 0, len = indices.length; j < len; j++) {
      i = indices[j];
      if (isNaN(sx[i] + sy[i] + _angle[i])) {
        continue;
      }
      if (this.retries[i] === -1) {
        continue;
      }
      if (image[i] == null) {
        continue;
      }
      results.push(this._render_image(ctx, i, image[i], sx, sy, sw, sh, _angle));
    }
    return results;
  };

  ImageURLView.prototype._final_sx_sy = function(anchor, sx, sy, sw, sh) {
    switch (anchor) {
      case "top_left":
        return [sx, sy];
      case "top_center":
        return [sx - sw / 2, sy];
      case "top_right":
        return [sx - sw, sy];
      case "right_center":
        return [sx - sw, sy - sh / 2];
      case "bottom_right":
        return [sx - sw, sy - sh];
      case "bottom_center":
        return [sx - sw / 2, sy - sh];
      case "bottom_left":
        return [sx, sy - sh];
      case "left_center":
        return [sx, sy - sh / 2];
      case "center":
        return [sx - sw / 2, sy - sh / 2];
    }
  };

  ImageURLView.prototype._render_image = function(ctx, i, image, sx, sy, sw, sh, angle) {
    var anchor, ref;
    if (isNaN(sw[i])) {
      sw[i] = image.width;
    }
    if (isNaN(sh[i])) {
      sh[i] = image.height;
    }
    anchor = this.model.anchor;
    ref = this._final_sx_sy(anchor, sx[i], sy[i], sw[i], sh[i]), sx = ref[0], sy = ref[1];
    ctx.save();
    ctx.globalAlpha = this.model.global_alpha;
    if (angle[i]) {
      ctx.translate(sx, sy);
      ctx.rotate(angle[i]);
      ctx.drawImage(image, 0, 0, sw[i], sh[i]);
      ctx.rotate(-angle[i]);
      ctx.translate(-sx, -sy);
    } else {
      ctx.drawImage(image, sx, sy, sw[i], sh[i]);
    }
    return ctx.restore();
  };

  return ImageURLView;

})(Glyph.View);

ImageURL = (function(superClass) {
  extend(ImageURL, superClass);

  function ImageURL() {
    return ImageURL.__super__.constructor.apply(this, arguments);
  }

  ImageURL.prototype.default_view = ImageURLView;

  ImageURL.prototype.type = 'ImageURL';

  ImageURL.coords([['x', 'y']]);

  ImageURL.mixins([]);

  ImageURL.define({
    url: [p.StringSpec],
    anchor: [p.Anchor, 'top_left'],
    global_alpha: [p.Number, 1.0],
    angle: [p.AngleSpec, 0],
    w: [p.DistanceSpec],
    h: [p.DistanceSpec],
    dilate: [p.Bool, false],
    retry_attempts: [p.Number, 0],
    retry_timeout: [p.Number, 0]
  });

  return ImageURL;

})(Glyph.Model);

module.exports = {
  Model: ImageURL,
  View: ImageURLView
};
