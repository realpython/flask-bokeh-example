var Glyph, Marker, MarkerView, _, hittest, p,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

Glyph = require("../glyphs/glyph");

hittest = require("../../core/hittest");

p = require("../../core/properties");

MarkerView = (function(superClass) {
  extend(MarkerView, superClass);

  function MarkerView() {
    return MarkerView.__super__.constructor.apply(this, arguments);
  }

  MarkerView.prototype.draw_legend_for_index = function(ctx, x0, x1, y0, y1, index) {
    var angle, data, indices, size, sx, sy;
    indices = [index];
    sx = {};
    sx[index] = (x0 + x1) / 2;
    sy = {};
    sy[index] = (y0 + y1) / 2;
    size = {};
    size[index] = Math.min(Math.abs(x1 - x0), Math.abs(y1 - y0)) * 0.4;
    angle = {};
    angle[index] = 0;
    data = {
      sx: sx,
      sy: sy,
      _size: size,
      _angle: angle
    };
    return this._render(ctx, indices, data);
  };

  MarkerView.prototype._render = function(ctx, indices, arg) {
    var _angle, _size, i, j, len, r, results, sx, sy;
    sx = arg.sx, sy = arg.sy, _size = arg._size, _angle = arg._angle;
    results = [];
    for (j = 0, len = indices.length; j < len; j++) {
      i = indices[j];
      if (isNaN(sx[i] + sy[i] + _size[i] + _angle[i])) {
        continue;
      }
      r = _size[i] / 2;
      ctx.beginPath();
      ctx.translate(sx[i], sy[i]);
      if (_angle[i]) {
        ctx.rotate(_angle[i]);
      }
      this._render_one(ctx, i, sx[i], sy[i], r, this.visuals.line, this.visuals.fill);
      if (_angle[i]) {
        ctx.rotate(-_angle[i]);
      }
      results.push(ctx.translate(-sx[i], -sy[i]));
    }
    return results;
  };

  MarkerView.prototype._index_data = function() {
    return this._xy_index();
  };

  MarkerView.prototype._mask_data = function(all_indices) {
    var bbox, hr, ref, ref1, vr, vx0, vx1, vy0, vy1, x, x0, x1, y0, y1;
    hr = this.renderer.plot_view.frame.h_range;
    vx0 = hr.start - this.max_size;
    vx1 = hr.end + this.max_size;
    ref = this.renderer.xmapper.v_map_from_target([vx0, vx1], true), x0 = ref[0], x1 = ref[1];
    vr = this.renderer.plot_view.frame.v_range;
    vy0 = vr.start - this.max_size;
    vy1 = vr.end + this.max_size;
    ref1 = this.renderer.ymapper.v_map_from_target([vy0, vy1], true), y0 = ref1[0], y1 = ref1[1];
    bbox = hittest.validate_bbox_coords([x0, x1], [y0, y1]);
    return (function() {
      var j, len, ref2, results;
      ref2 = this.index.search(bbox);
      results = [];
      for (j = 0, len = ref2.length; j < len; j++) {
        x = ref2[j];
        results.push(x.i);
      }
      return results;
    }).call(this);
  };

  MarkerView.prototype._hit_point = function(geometry) {
    var bbox, candidates, dist, hits, i, j, len, ref, ref1, ref2, result, s2, sx, sy, vx, vx0, vx1, vy, vy0, vy1, x, x0, x1, y0, y1;
    ref = [geometry.vx, geometry.vy], vx = ref[0], vy = ref[1];
    sx = this.renderer.plot_view.canvas.vx_to_sx(vx);
    sy = this.renderer.plot_view.canvas.vy_to_sy(vy);
    vx0 = vx - this.max_size;
    vx1 = vx + this.max_size;
    ref1 = this.renderer.xmapper.v_map_from_target([vx0, vx1], true), x0 = ref1[0], x1 = ref1[1];
    vy0 = vy - this.max_size;
    vy1 = vy + this.max_size;
    ref2 = this.renderer.ymapper.v_map_from_target([vy0, vy1], true), y0 = ref2[0], y1 = ref2[1];
    bbox = hittest.validate_bbox_coords([x0, x1], [y0, y1]);
    candidates = (function() {
      var j, len, ref3, results;
      ref3 = this.index.search(bbox);
      results = [];
      for (j = 0, len = ref3.length; j < len; j++) {
        x = ref3[j];
        results.push(x.i);
      }
      return results;
    }).call(this);
    hits = [];
    for (j = 0, len = candidates.length; j < len; j++) {
      i = candidates[j];
      s2 = this._size[i] / 2;
      dist = Math.abs(this.sx[i] - sx) + Math.abs(this.sy[i] - sy);
      if (Math.abs(this.sx[i] - sx) <= s2 && Math.abs(this.sy[i] - sy) <= s2) {
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

  MarkerView.prototype._hit_rect = function(geometry) {
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

  MarkerView.prototype._hit_poly = function(geometry) {
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

  return MarkerView;

})(Glyph.View);

Marker = (function(superClass) {
  extend(Marker, superClass);

  function Marker() {
    return Marker.__super__.constructor.apply(this, arguments);
  }

  Marker.coords([['x', 'y']]);

  Marker.mixins(['line', 'fill']);

  Marker.define({
    size: [
      p.DistanceSpec, {
        units: "screen",
        value: 4
      }
    ],
    angle: [p.AngleSpec, 0]
  });

  return Marker;

})(Glyph.Model);

module.exports = {
  Model: Marker,
  View: MarkerView
};
