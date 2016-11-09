var Annulus, AnnulusView, Glyph, _, hittest, p,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

Glyph = require("./glyph");

hittest = require("../../core/hittest");

p = require("../../core/properties");

AnnulusView = (function(superClass) {
  extend(AnnulusView, superClass);

  function AnnulusView() {
    return AnnulusView.__super__.constructor.apply(this, arguments);
  }

  AnnulusView.prototype._index_data = function() {
    return this._xy_index();
  };

  AnnulusView.prototype._map_data = function() {
    if (this.model.properties.inner_radius.units === "data") {
      this.sinner_radius = this.sdist(this.renderer.xmapper, this._x, this._inner_radius);
    } else {
      this.sinner_radius = this._inner_radius;
    }
    if (this.model.properties.outer_radius.units === "data") {
      return this.souter_radius = this.sdist(this.renderer.xmapper, this._x, this._outer_radius);
    } else {
      return this.souter_radius = this._outer_radius;
    }
  };

  AnnulusView.prototype._render = function(ctx, indices, arg) {
    var clockwise, i, isie, j, k, len, len1, ref, results, sinner_radius, souter_radius, sx, sy;
    sx = arg.sx, sy = arg.sy, sinner_radius = arg.sinner_radius, souter_radius = arg.souter_radius;
    results = [];
    for (j = 0, len = indices.length; j < len; j++) {
      i = indices[j];
      if (isNaN(sx[i] + sy[i] + sinner_radius[i] + souter_radius[i])) {
        continue;
      }
      isie = navigator.userAgent.indexOf('MSIE') >= 0 || navigator.userAgent.indexOf('Trident') > 0 || navigator.userAgent.indexOf('Edge') > 0;
      if (this.visuals.fill.doit) {
        this.visuals.fill.set_vectorize(ctx, i);
        ctx.beginPath();
        if (isie) {
          ref = [false, true];
          for (k = 0, len1 = ref.length; k < len1; k++) {
            clockwise = ref[k];
            ctx.arc(sx[i], sy[i], sinner_radius[i], 0, Math.PI, clockwise);
            ctx.arc(sx[i], sy[i], souter_radius[i], Math.PI, 0, !clockwise);
          }
        } else {
          ctx.arc(sx[i], sy[i], sinner_radius[i], 0, 2 * Math.PI, true);
          ctx.arc(sx[i], sy[i], souter_radius[i], 2 * Math.PI, 0, false);
        }
        ctx.fill();
      }
      if (this.visuals.line.doit) {
        this.visuals.line.set_vectorize(ctx, i);
        ctx.beginPath();
        ctx.arc(sx[i], sy[i], sinner_radius[i], 0, 2 * Math.PI);
        ctx.moveTo(sx[i] + souter_radius[i], sy[i]);
        ctx.arc(sx[i], sy[i], souter_radius[i], 0, 2 * Math.PI);
        results.push(ctx.stroke());
      } else {
        results.push(void 0);
      }
    }
    return results;
  };

  AnnulusView.prototype._hit_point = function(geometry) {
    var bbox, dist, hits, i, ir2, j, len, or2, pt, ref, ref1, result, sx0, sx1, sy0, sy1, vx, vy, x, x0, x1, y, y0, y1;
    ref = [geometry.vx, geometry.vy], vx = ref[0], vy = ref[1];
    x = this.renderer.xmapper.map_from_target(vx, true);
    x0 = x - this.max_radius;
    x1 = x + this.max_radius;
    y = this.renderer.ymapper.map_from_target(vy, true);
    y0 = y - this.max_radius;
    y1 = y + this.max_radius;
    hits = [];
    bbox = hittest.validate_bbox_coords([x0, x1], [y0, y1]);
    ref1 = (function() {
      var k, len, ref1, results;
      ref1 = this.index.search(bbox);
      results = [];
      for (k = 0, len = ref1.length; k < len; k++) {
        pt = ref1[k];
        results.push(pt.i);
      }
      return results;
    }).call(this);
    for (j = 0, len = ref1.length; j < len; j++) {
      i = ref1[j];
      or2 = Math.pow(this.souter_radius[i], 2);
      ir2 = Math.pow(this.sinner_radius[i], 2);
      sx0 = this.renderer.xmapper.map_to_target(x);
      sx1 = this.renderer.xmapper.map_to_target(this._x[i]);
      sy0 = this.renderer.ymapper.map_to_target(y);
      sy1 = this.renderer.ymapper.map_to_target(this._y[i]);
      dist = Math.pow(sx0 - sx1, 2) + Math.pow(sy0 - sy1, 2);
      if (dist <= or2 && dist >= ir2) {
        hits.push([i, dist]);
      }
    }
    result = hittest.create_hit_test_result();
    result['1d'].indices = _.chain(hits).sortBy(function(elt) {
      return elt[1];
    }).map(function(elt) {
      return elt[0];
    }).value();
    return result;
  };

  AnnulusView.prototype.draw_legend_for_index = function(ctx, x0, x1, y0, y1, index) {
    var data, indices, r, sinner_radius, souter_radius, sx, sy;
    indices = [index];
    sx = {};
    sx[index] = (x0 + x1) / 2;
    sy = {};
    sy[index] = (y0 + y1) / 2;
    r = Math.min(Math.abs(x1 - x0), Math.abs(y1 - y0)) * 0.5;
    sinner_radius = {};
    sinner_radius[index] = r * 0.4;
    souter_radius = {};
    souter_radius[index] = r * 0.8;
    data = {
      sx: sx,
      sy: sy,
      sinner_radius: sinner_radius,
      souter_radius: souter_radius
    };
    return this._render(ctx, indices, data);
  };

  return AnnulusView;

})(Glyph.View);

Annulus = (function(superClass) {
  extend(Annulus, superClass);

  function Annulus() {
    return Annulus.__super__.constructor.apply(this, arguments);
  }

  Annulus.prototype.default_view = AnnulusView;

  Annulus.prototype.type = 'Annulus';

  Annulus.coords([['x', 'y']]);

  Annulus.mixins(['line', 'fill']);

  Annulus.define({
    inner_radius: [p.DistanceSpec],
    outer_radius: [p.DistanceSpec]
  });

  return Annulus;

})(Glyph.Model);

module.exports = {
  Model: Annulus,
  View: AnnulusView
};
