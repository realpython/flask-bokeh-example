var Glyph, Wedge, WedgeView, _, angle_between, hittest, p,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

Glyph = require("./glyph");

hittest = require("../../core/hittest");

p = require("../../core/properties");

angle_between = require("../../core/util/math").angle_between;

WedgeView = (function(superClass) {
  extend(WedgeView, superClass);

  function WedgeView() {
    return WedgeView.__super__.constructor.apply(this, arguments);
  }

  WedgeView.prototype._index_data = function() {
    return this._xy_index();
  };

  WedgeView.prototype._map_data = function() {
    if (this.model.properties.radius.units === "data") {
      return this.sradius = this.sdist(this.renderer.xmapper, this._x, this._radius);
    } else {
      return this.sradius = this._radius;
    }
  };

  WedgeView.prototype._render = function(ctx, indices, arg) {
    var _end_angle, _start_angle, direction, i, j, len, results, sradius, sx, sy;
    sx = arg.sx, sy = arg.sy, sradius = arg.sradius, _start_angle = arg._start_angle, _end_angle = arg._end_angle;
    direction = this.model.properties.direction.value();
    results = [];
    for (j = 0, len = indices.length; j < len; j++) {
      i = indices[j];
      if (isNaN(sx[i] + sy[i] + sradius[i] + _start_angle[i] + _end_angle[i])) {
        continue;
      }
      ctx.beginPath();
      ctx.arc(sx[i], sy[i], sradius[i], _start_angle[i], _end_angle[i], direction);
      ctx.lineTo(sx[i], sy[i]);
      ctx.closePath();
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

  WedgeView.prototype._hit_point = function(geometry) {
    var angle, bbox, candidates, direction, dist, hits, i, j, k, len, len1, pt, r2, ref, ref1, ref2, ref3, ref4, result, sx, sx0, sx1, sy, sy0, sy1, vx, vx0, vx1, vy, vy0, vy1, x, x0, x1, y, y0, y1;
    ref = [geometry.vx, geometry.vy], vx = ref[0], vy = ref[1];
    x = this.renderer.xmapper.map_from_target(vx, true);
    y = this.renderer.ymapper.map_from_target(vy, true);
    if (this.model.properties.radius.units === "data") {
      x0 = x - this.max_radius;
      x1 = x + this.max_radius;
      y0 = y - this.max_radius;
      y1 = y + this.max_radius;
    } else {
      vx0 = vx - this.max_radius;
      vx1 = vx + this.max_radius;
      ref1 = this.renderer.xmapper.v_map_from_target([vx0, vx1], true), x0 = ref1[0], x1 = ref1[1];
      vy0 = vy - this.max_radius;
      vy1 = vy + this.max_radius;
      ref2 = this.renderer.ymapper.v_map_from_target([vy0, vy1], true), y0 = ref2[0], y1 = ref2[1];
    }
    candidates = [];
    bbox = hittest.validate_bbox_coords([x0, x1], [y0, y1]);
    ref3 = (function() {
      var k, len, ref3, results;
      ref3 = this.index.search(bbox);
      results = [];
      for (k = 0, len = ref3.length; k < len; k++) {
        pt = ref3[k];
        results.push(pt.i);
      }
      return results;
    }).call(this);
    for (j = 0, len = ref3.length; j < len; j++) {
      i = ref3[j];
      r2 = Math.pow(this.sradius[i], 2);
      sx0 = this.renderer.xmapper.map_to_target(x, true);
      sx1 = this.renderer.xmapper.map_to_target(this._x[i], true);
      sy0 = this.renderer.ymapper.map_to_target(y, true);
      sy1 = this.renderer.ymapper.map_to_target(this._y[i], true);
      dist = Math.pow(sx0 - sx1, 2) + Math.pow(sy0 - sy1, 2);
      if (dist <= r2) {
        candidates.push([i, dist]);
      }
    }
    direction = this.model.properties.direction.value();
    hits = [];
    for (k = 0, len1 = candidates.length; k < len1; k++) {
      ref4 = candidates[k], i = ref4[0], dist = ref4[1];
      sx = this.renderer.plot_view.canvas.vx_to_sx(vx);
      sy = this.renderer.plot_view.canvas.vy_to_sy(vy);
      angle = Math.atan2(sy - this.sy[i], sx - this.sx[i]);
      if (angle_between(-angle, -this._start_angle[i], -this._end_angle[i], direction)) {
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

  WedgeView.prototype.draw_legend_for_index = function(ctx, x0, x1, y0, y1, index) {
    return this._generic_area_legend(ctx, x0, x1, y0, y1, index);
  };

  return WedgeView;

})(Glyph.View);

Wedge = (function(superClass) {
  extend(Wedge, superClass);

  function Wedge() {
    return Wedge.__super__.constructor.apply(this, arguments);
  }

  Wedge.prototype.default_view = WedgeView;

  Wedge.prototype.type = 'Wedge';

  Wedge.coords([['x', 'y']]);

  Wedge.mixins(['line', 'fill']);

  Wedge.define({
    direction: [p.Direction, 'anticlock'],
    radius: [p.DistanceSpec],
    start_angle: [p.AngleSpec],
    end_angle: [p.AngleSpec]
  });

  return Wedge;

})(Glyph.Model);

module.exports = {
  Model: Wedge,
  View: WedgeView
};
