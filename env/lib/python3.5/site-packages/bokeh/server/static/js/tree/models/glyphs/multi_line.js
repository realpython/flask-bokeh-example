var Glyph, MultiLine, MultiLineView, _, hittest, rbush,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

rbush = require("rbush");

hittest = require("../../core/hittest");

Glyph = require("./glyph");

MultiLineView = (function(superClass) {
  extend(MultiLineView, superClass);

  function MultiLineView() {
    return MultiLineView.__super__.constructor.apply(this, arguments);
  }

  MultiLineView.prototype._index_data = function() {
    var i, index, k, pts, ref, x, xs, y, ys;
    index = rbush();
    pts = [];
    for (i = k = 0, ref = this._xs.length; 0 <= ref ? k < ref : k > ref; i = 0 <= ref ? ++k : --k) {
      xs = (function() {
        var l, len, ref1, results;
        ref1 = this._xs[i];
        results = [];
        for (l = 0, len = ref1.length; l < len; l++) {
          x = ref1[l];
          if (!_.isNaN(x)) {
            results.push(x);
          }
        }
        return results;
      }).call(this);
      ys = (function() {
        var l, len, ref1, results;
        ref1 = this._ys[i];
        results = [];
        for (l = 0, len = ref1.length; l < len; l++) {
          y = ref1[l];
          if (!_.isNaN(y)) {
            results.push(y);
          }
        }
        return results;
      }).call(this);
      if (xs.length === 0) {
        continue;
      }
      pts.push({
        minX: _.min(xs),
        minY: _.min(ys),
        maxX: _.max(xs),
        maxY: _.max(ys),
        i: i
      });
    }
    index.load(pts);
    return index;
  };

  MultiLineView.prototype._render = function(ctx, indices, arg) {
    var i, j, k, l, len, ref, ref1, results, sx, sxs, sy, sys;
    sxs = arg.sxs, sys = arg.sys;
    results = [];
    for (k = 0, len = indices.length; k < len; k++) {
      i = indices[k];
      ref = [sxs[i], sys[i]], sx = ref[0], sy = ref[1];
      this.visuals.line.set_vectorize(ctx, i);
      for (j = l = 0, ref1 = sx.length; 0 <= ref1 ? l < ref1 : l > ref1; j = 0 <= ref1 ? ++l : --l) {
        if (j === 0) {
          ctx.beginPath();
          ctx.moveTo(sx[j], sy[j]);
          continue;
        } else if (isNaN(sx[j]) || isNaN(sy[j])) {
          ctx.stroke();
          ctx.beginPath();
          continue;
        } else {
          ctx.lineTo(sx[j], sy[j]);
        }
      }
      results.push(ctx.stroke());
    }
    return results;
  };

  MultiLineView.prototype._hit_point = function(geometry) {
    var dist, hits, i, j, k, l, p0, p1, point, points, ref, ref1, ref2, result, shortest, threshold;
    result = hittest.create_hit_test_result();
    point = {
      x: this.renderer.plot_view.canvas.vx_to_sx(geometry.vx),
      y: this.renderer.plot_view.canvas.vy_to_sy(geometry.vy)
    };
    shortest = 9999;
    threshold = Math.max(2, this.visuals.line.line_width.value() / 2);
    hits = {};
    for (i = k = 0, ref = this.sxs.length; 0 <= ref ? k < ref : k > ref; i = 0 <= ref ? ++k : --k) {
      points = null;
      for (j = l = 0, ref1 = this.sxs[i].length - 1; 0 <= ref1 ? l < ref1 : l > ref1; j = 0 <= ref1 ? ++l : --l) {
        ref2 = [
          {
            x: this.sxs[i][j],
            y: this.sys[i][j]
          }, {
            x: this.sxs[i][j + 1],
            y: this.sys[i][j + 1]
          }
        ], p0 = ref2[0], p1 = ref2[1];
        dist = hittest.dist_to_segment(point, p0, p1);
        if (dist < threshold && dist < shortest) {
          shortest = dist;
          points = [j];
        }
      }
      if (points) {
        hits[i] = points;
      }
    }
    result['1d'].indices = _.keys(hits);
    result['2d'] = hits;
    return result;
  };

  MultiLineView.prototype._hit_span = function(geometry) {
    var hits, i, j, k, l, points, ref, ref1, ref2, result, val, values, vx, vy;
    ref = [geometry.vx, geometry.vy], vx = ref[0], vy = ref[1];
    result = hittest.create_hit_test_result();
    if (geometry.direction === 'v') {
      val = this.renderer.ymapper.map_from_target(vy);
      values = this._ys;
    } else {
      val = this.renderer.xmapper.map_from_target(vx);
      values = this._xs;
    }
    hits = {};
    for (i = k = 0, ref1 = values.length; 0 <= ref1 ? k < ref1 : k > ref1; i = 0 <= ref1 ? ++k : --k) {
      points = [];
      for (j = l = 0, ref2 = values[i].length - 1; 0 <= ref2 ? l < ref2 : l > ref2; j = 0 <= ref2 ? ++l : --l) {
        if ((values[i][j] <= val && val <= values[i][j + 1])) {
          points.push(j);
        }
      }
      if (points.length > 0) {
        hits[i] = points;
      }
    }
    result['1d'].indices = _.keys(hits);
    result['2d'] = hits;
    return result;
  };

  MultiLineView.prototype.get_interpolation_hit = function(i, point_i, geometry) {
    var ref, ref1, ref2, ref3, ref4, ref5, ref6, ref7, res, vx, vy, x0, x1, x2, x3, y0, y1, y2, y3;
    ref = [geometry.vx, geometry.vy], vx = ref[0], vy = ref[1];
    ref1 = [this._xs[i][point_i], this._ys[i][point_i], this._xs[i][point_i + 1], this._ys[i][point_i + 1]], x2 = ref1[0], y2 = ref1[1], x3 = ref1[2], y3 = ref1[3];
    if (geometry.type === 'point') {
      ref2 = this.renderer.ymapper.v_map_from_target([vy - 1, vy + 1]), y0 = ref2[0], y1 = ref2[1];
      ref3 = this.renderer.xmapper.v_map_from_target([vx - 1, vx + 1]), x0 = ref3[0], x1 = ref3[1];
    } else {
      if (geometry.direction === 'v') {
        ref4 = this.renderer.ymapper.v_map_from_target([vy, vy]), y0 = ref4[0], y1 = ref4[1];
        ref5 = [x2, x3], x0 = ref5[0], x1 = ref5[1];
      } else {
        ref6 = this.renderer.xmapper.v_map_from_target([vx, vx]), x0 = ref6[0], x1 = ref6[1];
        ref7 = [y2, y3], y0 = ref7[0], y1 = ref7[1];
      }
    }
    res = hittest.check_2_segments_intersect(x0, y0, x1, y1, x2, y2, x3, y3);
    return [res.x, res.y];
  };

  MultiLineView.prototype.draw_legend_for_index = function(ctx, x0, x1, y0, y1, index) {
    return this._generic_line_legend(ctx, x0, x1, y0, y1, index);
  };

  return MultiLineView;

})(Glyph.View);

MultiLine = (function(superClass) {
  extend(MultiLine, superClass);

  function MultiLine() {
    return MultiLine.__super__.constructor.apply(this, arguments);
  }

  MultiLine.prototype.default_view = MultiLineView;

  MultiLine.prototype.type = 'MultiLine';

  MultiLine.coords([['xs', 'ys']]);

  MultiLine.mixins(['line']);

  return MultiLine;

})(Glyph.Model);

module.exports = {
  Model: MultiLine,
  View: MultiLineView
};
