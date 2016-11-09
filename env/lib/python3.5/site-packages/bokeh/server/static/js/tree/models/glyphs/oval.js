var Glyph, Oval, OvalView, _, p,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

Glyph = require("./glyph");

p = require("../../core/properties");

OvalView = (function(superClass) {
  extend(OvalView, superClass);

  function OvalView() {
    return OvalView.__super__.constructor.apply(this, arguments);
  }

  OvalView.prototype._set_data = function() {
    this.max_w2 = 0;
    if (this.model.properties.width.units === "data") {
      this.max_w2 = this.max_width / 2;
    }
    this.max_h2 = 0;
    if (this.model.properties.height.units === "data") {
      return this.max_h2 = this.max_height / 2;
    }
  };

  OvalView.prototype._index_data = function() {
    return this._xy_index();
  };

  OvalView.prototype._map_data = function() {
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

  OvalView.prototype._render = function(ctx, indices, arg) {
    var i, j, len, results, sh, sw, sx, sy;
    sx = arg.sx, sy = arg.sy, sw = arg.sw, sh = arg.sh;
    results = [];
    for (j = 0, len = indices.length; j < len; j++) {
      i = indices[j];
      if (isNaN(sx[i] + sy[i] + sw[i] + sh[i] + this._angle[i])) {
        continue;
      }
      ctx.translate(sx[i], sy[i]);
      ctx.rotate(this._angle[i]);
      ctx.beginPath();
      ctx.moveTo(0, -sh[i] / 2);
      ctx.bezierCurveTo(sw[i] / 2, -sh[i] / 2, sw[i] / 2, sh[i] / 2, 0, sh[i] / 2);
      ctx.bezierCurveTo(-sw[i] / 2, sh[i] / 2, -sw[i] / 2, -sh[i] / 2, 0, -sh[i] / 2);
      ctx.closePath();
      if (this.visuals.fill.doit) {
        this.visuals.fill.set_vectorize(ctx, i);
        ctx.fill();
      }
      if (this.visuals.line.doit) {
        this.visuals.line.set_vectorize(ctx, i);
        ctx.stroke();
      }
      ctx.rotate(-this._angle[i]);
      results.push(ctx.translate(-sx[i], -sy[i]));
    }
    return results;
  };

  OvalView.prototype.draw_legend_for_index = function(ctx, x0, x1, y0, y1, index) {
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

  OvalView.prototype._bounds = function(bds) {
    return this.max_wh2_bounds(bds);
  };

  return OvalView;

})(Glyph.View);

Oval = (function(superClass) {
  extend(Oval, superClass);

  function Oval() {
    return Oval.__super__.constructor.apply(this, arguments);
  }

  Oval.prototype.default_view = OvalView;

  Oval.prototype.type = 'Oval';

  Oval.coords([['x', 'y']]);

  Oval.mixins(['line', 'fill']);

  Oval.define({
    angle: [p.AngleSpec, 0.0],
    width: [p.DistanceSpec],
    height: [p.DistanceSpec]
  });

  return Oval;

})(Glyph.Model);

module.exports = {
  Model: Oval,
  View: OvalView
};
