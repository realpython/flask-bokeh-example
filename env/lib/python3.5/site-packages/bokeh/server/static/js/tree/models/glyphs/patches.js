var Glyph, Patches, PatchesView, _, hittest, rbush,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

rbush = require("rbush");

Glyph = require("./glyph");

hittest = require("../../core/hittest");

PatchesView = (function(superClass) {
  extend(PatchesView, superClass);

  function PatchesView() {
    return PatchesView.__super__.constructor.apply(this, arguments);
  }

  PatchesView.prototype._build_discontinuous_object = function(nanned_qs) {
    var denanned, ds, i, k, nan_index, q, qs, qs_part, ref;
    ds = {};
    for (i = k = 0, ref = nanned_qs.length; 0 <= ref ? k < ref : k > ref; i = 0 <= ref ? ++k : --k) {
      ds[i] = [];
      qs = _.toArray(nanned_qs[i]);
      while (qs.length > 0) {
        nan_index = _.findLastIndex(qs, function(q) {
          return _.isNaN(q);
        });
        if (nan_index >= 0) {
          qs_part = qs.splice(nan_index);
        } else {
          qs_part = qs;
          qs = [];
        }
        denanned = (function() {
          var l, len, results;
          results = [];
          for (l = 0, len = qs_part.length; l < len; l++) {
            q = qs_part[l];
            if (!_.isNaN(q)) {
              results.push(q);
            }
          }
          return results;
        })();
        ds[i].push(denanned);
      }
    }
    return ds;
  };

  PatchesView.prototype._index_data = function() {
    var i, index, j, k, l, pts, ref, ref1, xs, xss, ys, yss;
    index = rbush();
    pts = [];
    xss = this._build_discontinuous_object(this._xs);
    yss = this._build_discontinuous_object(this._ys);
    for (i = k = 0, ref = this._xs.length; 0 <= ref ? k < ref : k > ref; i = 0 <= ref ? ++k : --k) {
      for (j = l = 0, ref1 = xss[i].length; 0 <= ref1 ? l < ref1 : l > ref1; j = 0 <= ref1 ? ++l : --l) {
        xs = xss[i][j];
        ys = yss[i][j];
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
    }
    index.load(pts);
    return index;
  };

  PatchesView.prototype._mask_data = function(all_indices) {
    var bbox, ref, ref1, x, x0, x1, xr, y0, y1, yr;
    xr = this.renderer.plot_view.x_range;
    ref = [xr.min, xr.max], x0 = ref[0], x1 = ref[1];
    yr = this.renderer.plot_view.y_range;
    ref1 = [yr.min, yr.max], y0 = ref1[0], y1 = ref1[1];
    bbox = hittest.validate_bbox_coords([x0, x1], [y0, y1]);
    return (function() {
      var k, len, ref2, results;
      ref2 = this.index.search(bbox);
      results = [];
      for (k = 0, len = ref2.length; k < len; k++) {
        x = ref2[k];
        results.push(x.i);
      }
      return results;
    }).call(this);
  };

  PatchesView.prototype._render = function(ctx, indices, arg) {
    var i, j, k, l, len, m, ref, ref1, ref2, results, sx, sxs, sy, sys;
    sxs = arg.sxs, sys = arg.sys;
    this.renderer.sxss = this._build_discontinuous_object(sxs);
    this.renderer.syss = this._build_discontinuous_object(sys);
    results = [];
    for (k = 0, len = indices.length; k < len; k++) {
      i = indices[k];
      ref = [sxs[i], sys[i]], sx = ref[0], sy = ref[1];
      if (this.visuals.fill.doit) {
        this.visuals.fill.set_vectorize(ctx, i);
        for (j = l = 0, ref1 = sx.length; 0 <= ref1 ? l < ref1 : l > ref1; j = 0 <= ref1 ? ++l : --l) {
          if (j === 0) {
            ctx.beginPath();
            ctx.moveTo(sx[j], sy[j]);
            continue;
          } else if (isNaN(sx[j] + sy[j])) {
            ctx.closePath();
            ctx.fill();
            ctx.beginPath();
            continue;
          } else {
            ctx.lineTo(sx[j], sy[j]);
          }
        }
        ctx.closePath();
        ctx.fill();
      }
      if (this.visuals.line.doit) {
        this.visuals.line.set_vectorize(ctx, i);
        for (j = m = 0, ref2 = sx.length; 0 <= ref2 ? m < ref2 : m > ref2; j = 0 <= ref2 ? ++m : --m) {
          if (j === 0) {
            ctx.beginPath();
            ctx.moveTo(sx[j], sy[j]);
            continue;
          } else if (isNaN(sx[j] + sy[j])) {
            ctx.closePath();
            ctx.stroke();
            ctx.beginPath();
            continue;
          } else {
            ctx.lineTo(sx[j], sy[j]);
          }
        }
        ctx.closePath();
        results.push(ctx.stroke());
      } else {
        results.push(void 0);
      }
    }
    return results;
  };

  PatchesView.prototype._hit_point = function(geometry) {
    var candidates, hits, i, idx, j, k, l, ref, ref1, ref2, result, sx, sxs, sy, sys, vx, vy, x, y;
    ref = [geometry.vx, geometry.vy], vx = ref[0], vy = ref[1];
    sx = this.renderer.plot_view.canvas.vx_to_sx(vx);
    sy = this.renderer.plot_view.canvas.vy_to_sy(vy);
    x = this.renderer.xmapper.map_from_target(vx, true);
    y = this.renderer.ymapper.map_from_target(vy, true);
    candidates = (function() {
      var k, len, ref1, results;
      ref1 = this.index.search({
        minX: x,
        minY: y,
        maxX: x,
        maxY: y
      });
      results = [];
      for (k = 0, len = ref1.length; k < len; k++) {
        x = ref1[k];
        results.push(x.i);
      }
      return results;
    }).call(this);
    hits = [];
    for (i = k = 0, ref1 = candidates.length; 0 <= ref1 ? k < ref1 : k > ref1; i = 0 <= ref1 ? ++k : --k) {
      idx = candidates[i];
      sxs = this.renderer.sxss[idx];
      sys = this.renderer.syss[idx];
      for (j = l = 0, ref2 = sxs.length; 0 <= ref2 ? l < ref2 : l > ref2; j = 0 <= ref2 ? ++l : --l) {
        if (hittest.point_in_poly(sx, sy, sxs[j], sys[j])) {
          hits.push(idx);
        }
      }
    }
    result = hittest.create_hit_test_result();
    result['1d'].indices = hits;
    return result;
  };

  PatchesView.prototype._get_snap_coord = function(array) {
    var k, len, s, sum;
    sum = 0;
    for (k = 0, len = array.length; k < len; k++) {
      s = array[k];
      sum += s;
    }
    return sum / array.length;
  };

  PatchesView.prototype.scx = function(i, sx, sy) {
    var j, k, ref, sxs, sys;
    if (this.renderer.sxss[i].length === 1) {
      return this._get_snap_coord(this.sxs[i]);
    } else {
      sxs = this.renderer.sxss[i];
      sys = this.renderer.syss[i];
      for (j = k = 0, ref = sxs.length; 0 <= ref ? k < ref : k > ref; j = 0 <= ref ? ++k : --k) {
        if (hittest.point_in_poly(sx, sy, sxs[j], sys[j])) {
          return this._get_snap_coord(sxs[j]);
        }
      }
    }
    return null;
  };

  PatchesView.prototype.scy = function(i, sx, sy) {
    var j, k, ref, sxs, sys;
    if (this.renderer.syss[i].length === 1) {
      return this._get_snap_coord(this.sys[i]);
    } else {
      sxs = this.renderer.sxss[i];
      sys = this.renderer.syss[i];
      for (j = k = 0, ref = sxs.length; 0 <= ref ? k < ref : k > ref; j = 0 <= ref ? ++k : --k) {
        if (hittest.point_in_poly(sx, sy, sxs[j], sys[j])) {
          return this._get_snap_coord(sys[j]);
        }
      }
    }
  };

  PatchesView.prototype.draw_legend_for_index = function(ctx, x0, x1, y0, y1, index) {
    return this._generic_area_legend(ctx, x0, x1, y0, y1, index);
  };

  return PatchesView;

})(Glyph.View);

Patches = (function(superClass) {
  extend(Patches, superClass);

  function Patches() {
    return Patches.__super__.constructor.apply(this, arguments);
  }

  Patches.prototype.default_view = PatchesView;

  Patches.prototype.type = 'Patches';

  Patches.coords([['xs', 'ys']]);

  Patches.mixins(['line', 'fill']);

  return Patches;

})(Glyph.Model);

module.exports = {
  Model: Patches,
  View: PatchesView
};
