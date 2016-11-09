var Circle, CircleView, Glyph, _, hittest, p,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

Glyph = require("./glyph");

hittest = require("../../core/hittest");

p = require("../../core/properties");

CircleView = (function(superClass) {
  extend(CircleView, superClass);

  function CircleView() {
    return CircleView.__super__.constructor.apply(this, arguments);
  }

  CircleView.prototype._index_data = function() {
    return this._xy_index();
  };

  CircleView.prototype._map_data = function() {
    var rd, s;
    if (this._radius != null) {
      if (this.model.properties.radius.spec.units === "data") {
        rd = this.model.properties.radius_dimension.spec.value;
        return this.sradius = this.sdist(this.renderer[rd + "mapper"], this["_" + rd], this._radius);
      } else {
        this.sradius = this._radius;
        return this.max_size = 2 * this.max_radius;
      }
    } else {
      return this.sradius = (function() {
        var j, len, ref, results;
        ref = this._size;
        results = [];
        for (j = 0, len = ref.length; j < len; j++) {
          s = ref[j];
          results.push(s / 2);
        }
        return results;
      }).call(this);
    }
  };

  CircleView.prototype._mask_data = function(all_indices) {
    var bbox, hr, ref, ref1, ref2, ref3, sx0, sx1, sy0, sy1, vr, x, x0, x1, y0, y1;
    hr = this.renderer.plot_view.frame.h_range;
    vr = this.renderer.plot_view.frame.v_range;
    if ((this._radius != null) && this.model.properties.radius.units === "data") {
      sx0 = hr.start;
      sx1 = hr.end;
      ref = this.renderer.xmapper.v_map_from_target([sx0, sx1], true), x0 = ref[0], x1 = ref[1];
      x0 -= this.max_radius;
      x1 += this.max_radius;
      sy0 = vr.start;
      sy1 = vr.end;
      ref1 = this.renderer.ymapper.v_map_from_target([sy0, sy1], true), y0 = ref1[0], y1 = ref1[1];
      y0 -= this.max_radius;
      y1 += this.max_radius;
    } else {
      sx0 = hr.start - this.max_size;
      sx1 = hr.end + this.max_size;
      ref2 = this.renderer.xmapper.v_map_from_target([sx0, sx1], true), x0 = ref2[0], x1 = ref2[1];
      sy0 = vr.start - this.max_size;
      sy1 = vr.end + this.max_size;
      ref3 = this.renderer.ymapper.v_map_from_target([sy0, sy1], true), y0 = ref3[0], y1 = ref3[1];
    }
    bbox = hittest.validate_bbox_coords([x0, x1], [y0, y1]);
    return (function() {
      var j, len, ref4, results;
      ref4 = this.index.search(bbox);
      results = [];
      for (j = 0, len = ref4.length; j < len; j++) {
        x = ref4[j];
        results.push(x.i);
      }
      return results;
    }).call(this);
  };

  CircleView.prototype._render = function(ctx, indices, arg) {
    var i, j, len, results, sradius, sx, sy;
    sx = arg.sx, sy = arg.sy, sradius = arg.sradius;
    results = [];
    for (j = 0, len = indices.length; j < len; j++) {
      i = indices[j];
      if (isNaN(sx[i] + sy[i] + sradius[i])) {
        continue;
      }
      ctx.beginPath();
      ctx.arc(sx[i], sy[i], sradius[i], 0, 2 * Math.PI, false);
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

  CircleView.prototype._hit_point = function(geometry) {
    var bbox, candidates, dist, hits, i, j, k, len, len1, pt, r2, ref, ref1, ref2, ref3, ref4, result, sx, sx0, sx1, sy, sy0, sy1, vx, vx0, vx1, vy, vy0, vy1, x, x0, x1, y, y0, y1;
    ref = [geometry.vx, geometry.vy], vx = ref[0], vy = ref[1];
    x = this.renderer.xmapper.map_from_target(vx, true);
    y = this.renderer.ymapper.map_from_target(vy, true);
    if ((this._radius != null) && this.model.properties.radius.units === "data") {
      x0 = x - this.max_radius;
      x1 = x + this.max_radius;
      y0 = y - this.max_radius;
      y1 = y + this.max_radius;
    } else {
      vx0 = vx - this.max_size;
      vx1 = vx + this.max_size;
      ref1 = this.renderer.xmapper.v_map_from_target([vx0, vx1], true), x0 = ref1[0], x1 = ref1[1];
      ref2 = [Math.min(x0, x1), Math.max(x0, x1)], x0 = ref2[0], x1 = ref2[1];
      vy0 = vy - this.max_size;
      vy1 = vy + this.max_size;
      ref3 = this.renderer.ymapper.v_map_from_target([vy0, vy1], true), y0 = ref3[0], y1 = ref3[1];
      ref4 = [Math.min(y0, y1), Math.max(y0, y1)], y0 = ref4[0], y1 = ref4[1];
    }
    bbox = hittest.validate_bbox_coords([x0, x1], [y0, y1]);
    candidates = (function() {
      var j, len, ref5, results;
      ref5 = this.index.search(bbox);
      results = [];
      for (j = 0, len = ref5.length; j < len; j++) {
        pt = ref5[j];
        results.push(pt.i);
      }
      return results;
    }).call(this);
    hits = [];
    if ((this._radius != null) && this.model.properties.radius.units === "data") {
      for (j = 0, len = candidates.length; j < len; j++) {
        i = candidates[j];
        r2 = Math.pow(this.sradius[i], 2);
        sx0 = this.renderer.xmapper.map_to_target(x, true);
        sx1 = this.renderer.xmapper.map_to_target(this._x[i], true);
        sy0 = this.renderer.ymapper.map_to_target(y, true);
        sy1 = this.renderer.ymapper.map_to_target(this._y[i], true);
        dist = Math.pow(sx0 - sx1, 2) + Math.pow(sy0 - sy1, 2);
        if (dist <= r2) {
          hits.push([i, dist]);
        }
      }
    } else {
      sx = this.renderer.plot_view.canvas.vx_to_sx(vx);
      sy = this.renderer.plot_view.canvas.vy_to_sy(vy);
      for (k = 0, len1 = candidates.length; k < len1; k++) {
        i = candidates[k];
        r2 = Math.pow(this.sradius[i], 2);
        dist = Math.pow(this.sx[i] - sx, 2) + Math.pow(this.sy[i] - sy, 2);
        if (dist <= r2) {
          hits.push([i, dist]);
        }
      }
    }
    hits = _.chain(hits).sortBy(function(elt) {
      return elt[1];
    }).map(function(elt) {
      return elt[0];
    }).value();
    result = hittest.create_hit_test_result();
    result['1d'].indices = hits;
    return result;
  };

  CircleView.prototype._hit_span = function(geometry) {
    var bbox, hits, maxX, maxY, minX, minY, ms, ref, ref1, ref2, ref3, ref4, ref5, result, vx, vx0, vx1, vy, vy0, vy1, x0, x1, xx, y0, y1;
    ref = [geometry.vx, geometry.vy], vx = ref[0], vy = ref[1];
    ref1 = this.bounds(), minX = ref1.minX, minY = ref1.minY, maxX = ref1.maxX, maxY = ref1.maxY;
    result = hittest.create_hit_test_result();
    if (geometry.direction === 'h') {
      y0 = minY;
      y1 = maxY;
      if ((this._radius != null) && this.model.properties.radius.units === "data") {
        vx0 = vx - this.max_radius;
        vx1 = vx + this.max_radius;
        ref2 = this.renderer.xmapper.v_map_from_target([vx0, vx1]), x0 = ref2[0], x1 = ref2[1];
      } else {
        ms = this.max_size / 2;
        vx0 = vx - ms;
        vx1 = vx + ms;
        ref3 = this.renderer.xmapper.v_map_from_target([vx0, vx1], true), x0 = ref3[0], x1 = ref3[1];
      }
    } else {
      x0 = minX;
      x1 = maxX;
      if ((this._radius != null) && this.model.properties.radius.units === "data") {
        vy0 = vy - this.max_radius;
        vy1 = vy + this.max_radius;
        ref4 = this.renderer.ymapper.v_map_from_target([vy0, vy1]), y0 = ref4[0], y1 = ref4[1];
      } else {
        ms = this.max_size / 2;
        vy0 = vy - ms;
        vy1 = vy + ms;
        ref5 = this.renderer.ymapper.v_map_from_target([vy0, vy1], true), y0 = ref5[0], y1 = ref5[1];
      }
    }
    bbox = hittest.validate_bbox_coords([x0, x1], [y0, y1]);
    hits = (function() {
      var j, len, ref6, results;
      ref6 = this.index.search(bbox);
      results = [];
      for (j = 0, len = ref6.length; j < len; j++) {
        xx = ref6[j];
        results.push(xx.i);
      }
      return results;
    }).call(this);
    result['1d'].indices = hits;
    return result;
  };

  CircleView.prototype._hit_rect = function(geometry) {
    var bbox, ref, ref1, result, x, x0, x1, y0, y1;
    ref = this.renderer.xmapper.v_map_from_target([geometry.vx0, geometry.vx1], true), x0 = ref[0], x1 = ref[1];
    ref1 = this.renderer.ymapper.v_map_from_target([geometry.vy0, geometry.vy1], true), y0 = ref1[0], y1 = ref1[1];
    bbox = hittest.validate_bbox_coords([x0, x1], [y0, y1]);
    result = hittest.create_hit_test_result();
    result['1d'].indices = (function() {
      var j, len, ref2, results;
      ref2 = this.index.search(bbox);
      results = [];
      for (j = 0, len = ref2.length; j < len; j++) {
        x = ref2[j];
        results.push(x.i);
      }
      return results;
    }).call(this);
    return result;
  };

  CircleView.prototype._hit_poly = function(geometry) {
    var candidates, hits, i, idx, j, k, ref, ref1, ref2, result, results, sx, sy, vx, vy;
    ref = [geometry.vx, geometry.vy], vx = ref[0], vy = ref[1];
    sx = this.renderer.plot_view.canvas.v_vx_to_sx(vx);
    sy = this.renderer.plot_view.canvas.v_vy_to_sy(vy);
    candidates = (function() {
      results = [];
      for (var j = 0, ref1 = this.sx.length; 0 <= ref1 ? j < ref1 : j > ref1; 0 <= ref1 ? j++ : j--){ results.push(j); }
      return results;
    }).apply(this);
    hits = [];
    for (i = k = 0, ref2 = candidates.length; 0 <= ref2 ? k < ref2 : k > ref2; i = 0 <= ref2 ? ++k : --k) {
      idx = candidates[i];
      if (hittest.point_in_poly(this.sx[i], this.sy[i], sx, sy)) {
        hits.push(idx);
      }
    }
    result = hittest.create_hit_test_result();
    result['1d'].indices = hits;
    return result;
  };

  CircleView.prototype.draw_legend_for_index = function(ctx, x0, x1, y0, y1, index) {
    var data, indices, sradius, sx, sy;
    indices = [index];
    sx = {};
    sx[index] = (x0 + x1) / 2;
    sy = {};
    sy[index] = (y0 + y1) / 2;
    sradius = {};
    sradius[index] = Math.min(Math.abs(x1 - x0), Math.abs(y1 - y0)) * 0.2;
    data = {
      sx: sx,
      sy: sy,
      sradius: sradius
    };
    return this._render(ctx, indices, data);
  };

  return CircleView;

})(Glyph.View);

Circle = (function(superClass) {
  extend(Circle, superClass);

  function Circle() {
    return Circle.__super__.constructor.apply(this, arguments);
  }

  Circle.prototype.default_view = CircleView;

  Circle.prototype.type = 'Circle';

  Circle.coords([['x', 'y']]);

  Circle.mixins(['line', 'fill']);

  Circle.define({
    angle: [p.AngleSpec, 0],
    size: [
      p.DistanceSpec, {
        units: "screen",
        value: 4
      }
    ],
    radius: [p.DistanceSpec, null],
    radius_dimension: [p.String, 'x']
  });

  Circle.prototype.initialize = function(attrs, options) {
    Circle.__super__.initialize.call(this, attrs, options);
    return this.properties.radius.optional = true;
  };

  return Circle;

})(Glyph.Model);

module.exports = {
  Model: Circle,
  View: CircleView
};
