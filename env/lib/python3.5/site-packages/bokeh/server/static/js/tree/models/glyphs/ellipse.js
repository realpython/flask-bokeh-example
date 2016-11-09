var Ellipse, EllipseView, Glyph, _, p,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

Glyph = require("./glyph");

p = require("../../core/properties");

EllipseView = (function(superClass) {
  extend(EllipseView, superClass);

  function EllipseView() {
    return EllipseView.__super__.constructor.apply(this, arguments);
  }

  EllipseView.prototype._set_data = function() {
    this.max_w2 = 0;
    if (this.model.properties.width.units === "data") {
      this.max_w2 = this.max_width / 2;
    }
    this.max_h2 = 0;
    if (this.model.properties.height.units === "data") {
      return this.max_h2 = this.max_height / 2;
    }
  };

  EllipseView.prototype._index_data = function() {
    return this._xy_index();
  };

  EllipseView.prototype._map_data = function() {
    if (this.model.properties.width.units === "data") {
      this.sw = this.sdist(this.renderer.xmapper, this._x, this._width, 'center');
    } else {
      this.sw = this._width;
    }
    if (this.model.properties.height.units === "data") {
      return this.sh = this.sdist(this.renderer.ymapper, this._y, this._height, 'center');
    } else {
      return this.sh = this._height;
    }
  };

  EllipseView.prototype._render = function(ctx, indices, arg) {
    var i, j, len, results, sh, sw, sx, sy;
    sx = arg.sx, sy = arg.sy, sw = arg.sw, sh = arg.sh;
    results = [];
    for (j = 0, len = indices.length; j < len; j++) {
      i = indices[j];
      if (isNaN(sx[i] + sy[i] + sw[i] + sh[i] + this._angle[i])) {
        continue;
      }
      ctx.beginPath();
      ctx.ellipse(sx[i], sy[i], sw[i] / 2.0, sh[i] / 2.0, this._angle[i], 0, 2 * Math.PI);
      if (this.visuals.fill.doit) {
        this.visuals.fill.set_vectorize(ctx, i);
        ctx.fill();
      }
      if (this.visuals.line.doit) {
        this.visuals.line.set_vectorize(ctx, i);
        results.push(ctx.stroke());
      } else {
        results.push(void 0);
      }
    }
    return results;
  };

  EllipseView.prototype.draw_legend_for_index = function(ctx, x0, x1, y0, y1, index) {
    var d, data, indices, scale, sh, sw, sx, sy;
    indices = [index];
    sx = {};
    sx[index] = (x0 + x1) / 2;
    sy = {};
    sy[index] = (y0 + y1) / 2;
    scale = this.sw[index] / this.sh[index];
    d = Math.min(Math.abs(x1 - x0), Math.abs(y1 - y0)) * 0.8;
    sw = {};
    sh = {};
    if (scale > 1) {
      sw[index] = d;
      sh[index] = d / scale;
    } else {
      sw[index] = d * scale;
      sh[index] = d;
    }
    data = {
      sx: sx,
      sy: sy,
      sw: sw,
      sh: sh
    };
    return this._render(ctx, indices, data);
  };

  EllipseView.prototype._bounds = function(bds) {
    return this.max_wh2_bounds(bds);
  };

  return EllipseView;

})(Glyph.View);

Ellipse = (function(superClass) {
  extend(Ellipse, superClass);

  function Ellipse() {
    return Ellipse.__super__.constructor.apply(this, arguments);
  }

  Ellipse.prototype.default_view = EllipseView;

  Ellipse.prototype.type = 'Ellipse';

  Ellipse.coords([['x', 'y']]);

  Ellipse.mixins(['line', 'fill']);

  Ellipse.define({
    angle: [p.AngleSpec, 0.0],
    width: [p.DistanceSpec],
    height: [p.DistanceSpec]
  });

  return Ellipse;

})(Glyph.Model);

module.exports = {
  Model: Ellipse,
  View: EllipseView
};
