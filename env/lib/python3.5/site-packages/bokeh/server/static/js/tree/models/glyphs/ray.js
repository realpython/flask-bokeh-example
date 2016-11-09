var Glyph, Ray, RayView, _, p,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

Glyph = require("./glyph");

p = require("../../core/properties");

RayView = (function(superClass) {
  extend(RayView, superClass);

  function RayView() {
    return RayView.__super__.constructor.apply(this, arguments);
  }

  RayView.prototype._index_data = function() {
    return this._xy_index();
  };

  RayView.prototype._map_data = function() {
    return this.slength = this.sdist(this.renderer.xmapper, this._x, this._length);
  };

  RayView.prototype._render = function(ctx, indices, arg) {
    var _angle, height, i, inf_len, j, k, len, ref, results, slength, sx, sy, width;
    sx = arg.sx, sy = arg.sy, slength = arg.slength, _angle = arg._angle;
    if (this.visuals.line.doit) {
      width = this.renderer.plot_view.frame.width;
      height = this.renderer.plot_view.frame.height;
      inf_len = 2 * (width + height);
      for (i = j = 0, ref = slength.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
        if (slength[i] === 0) {
          slength[i] = inf_len;
        }
      }
      results = [];
      for (k = 0, len = indices.length; k < len; k++) {
        i = indices[k];
        if (isNaN(sx[i] + sy[i] + _angle[i] + slength[i])) {
          continue;
        }
        ctx.translate(sx[i], sy[i]);
        ctx.rotate(_angle[i]);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(slength[i], 0);
        this.visuals.line.set_vectorize(ctx, i);
        ctx.stroke();
        ctx.rotate(-_angle[i]);
        results.push(ctx.translate(-sx[i], -sy[i]));
      }
      return results;
    }
  };

  RayView.prototype.draw_legend_for_index = function(ctx, x0, x1, y0, y1, index) {
    return this._generic_line_legend(ctx, x0, x1, y0, y1, index);
  };

  return RayView;

})(Glyph.View);

Ray = (function(superClass) {
  extend(Ray, superClass);

  function Ray() {
    return Ray.__super__.constructor.apply(this, arguments);
  }

  Ray.prototype.default_view = RayView;

  Ray.prototype.type = 'Ray';

  Ray.coords([['x', 'y']]);

  Ray.mixins(['line']);

  Ray.define({
    length: [p.DistanceSpec],
    angle: [p.AngleSpec]
  });

  return Ray;

})(Glyph.Model);

module.exports = {
  Model: Ray,
  View: RayView
};
