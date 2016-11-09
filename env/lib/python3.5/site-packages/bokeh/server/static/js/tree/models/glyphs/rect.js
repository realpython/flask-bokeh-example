var Glyph, Rect, RectView, _, hittest, p,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

Glyph = require("./glyph");

hittest = require("../../core/hittest");

p = require("../../core/properties");

RectView = (function(superClass) {
  extend(RectView, superClass);

  function RectView() {
    return RectView.__super__.constructor.apply(this, arguments);
  }

  RectView.prototype._set_data = function() {
    this.max_w2 = 0;
    if (this.model.properties.width.units === "data") {
      this.max_w2 = this.max_width / 2;
    }
    this.max_h2 = 0;
    if (this.model.properties.height.units === "data") {
      return this.max_h2 = this.max_height / 2;
    }
  };

  RectView.prototype._index_data = function() {
    return this._xy_index();
  };

  RectView.prototype._map_data = function() {
    if (this.model.properties.width.units === "data") {
      this.sw = this.sdist(this.renderer.xmapper, this._x, this._width, 'center', this.model.dilate);
    } else {
      this.sw = this._width;
    }
    if (this.model.properties.height.units === "data") {
      return this.sh = this.sdist(this.renderer.ymapper, this._y, this._height, 'center', this.model.dilate);
    } else {
      return this.sh = this._height;
    }
  };

  RectView.prototype._render = function(ctx, indices, arg) {
    var _angle, i, j, k, len, len1, sh, sw, sx, sy;
    sx = arg.sx, sy = arg.sy, sw = arg.sw, sh = arg.sh, _angle = arg._angle;
    if (this.visuals.fill.doit) {
      for (j = 0, len = indices.length; j < len; j++) {
        i = indices[j];
        if (isNaN(sx[i] + sy[i] + sw[i] + sh[i] + _angle[i])) {
          continue;
        }
        this.visuals.fill.set_vectorize(ctx, i);
        if (_angle[i]) {
          ctx.translate(sx[i], sy[i]);
          ctx.rotate(_angle[i]);
          ctx.fillRect(-sw[i] / 2, -sh[i] / 2, sw[i], sh[i]);
          ctx.rotate(-_angle[i]);
          ctx.translate(-sx[i], -sy[i]);
        } else {
          ctx.fillRect(sx[i] - sw[i] / 2, sy[i] - sh[i] / 2, sw[i], sh[i]);
        }
      }
    }
    if (this.visuals.line.doit) {
      ctx.beginPath();
      for (k = 0, len1 = indices.length; k < len1; k++) {
        i = indices[k];
        if (isNaN(sx[i] + sy[i] + sw[i] + sh[i] + _angle[i])) {
          continue;
        }
        if (sw[i] === 0 || sh[i] === 0) {
          continue;
        }
        if (_angle[i]) {
          ctx.translate(sx[i], sy[i]);
          ctx.rotate(_angle[i]);
          ctx.rect(-sw[i] / 2, -sh[i] / 2, sw[i], sh[i]);
          ctx.rotate(-_angle[i]);
          ctx.translate(-sx[i], -sy[i]);
        } else {
          ctx.rect(sx[i] - sw[i] / 2, sy[i] - sh[i] / 2, sw[i], sh[i]);
        }
        this.visuals.line.set_vectorize(ctx, i);
        ctx.stroke();
        ctx.beginPath();
      }
      return ctx.stroke();
    }
  };

  RectView.prototype._hit_rect = function(geometry) {
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

  RectView.prototype._hit_point = function(geometry) {
    var bbox, c, d, height_in, hits, i, j, len, pt, px, py, ref, ref1, ref2, ref3, result, s, sx, sy, vx, vx0, vx1, vy, vy0, vy1, width_in, x, x0, x1, y, y0, y1;
    ref = [geometry.vx, geometry.vy], vx = ref[0], vy = ref[1];
    x = this.renderer.xmapper.map_from_target(vx, true);
    y = this.renderer.ymapper.map_from_target(vy, true);
    if (this.model.properties.width.units === "screen") {
      vx0 = vx - 2 * this.max_width;
      vx1 = vx + 2 * this.max_width;
      ref1 = this.renderer.xmapper.v_map_from_target([vx0, vx1], true), x0 = ref1[0], x1 = ref1[1];
    } else {
      x0 = x - 2 * this.max_width;
      x1 = x + 2 * this.max_width;
    }
    if (this.model.properties.height.units === "screen") {
      vy0 = vy - 2 * this.max_height;
      vy1 = vy + 2 * this.max_height;
      ref2 = this.renderer.ymapper.v_map_from_target([vy0, vy1], true), y0 = ref2[0], y1 = ref2[1];
    } else {
      y0 = y - 2 * this.max_height;
      y1 = y + 2 * this.max_height;
    }
    hits = [];
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
      sx = this.renderer.plot_view.canvas.vx_to_sx(vx);
      sy = this.renderer.plot_view.canvas.vy_to_sy(vy);
      if (this._angle[i]) {
        d = Math.sqrt(Math.pow(sx - this.sx[i], 2) + Math.pow(sy - this.sy[i], 2));
        s = Math.sin(-this._angle[i]);
        c = Math.cos(-this._angle[i]);
        px = c * (sx - this.sx[i]) - s * (sy - this.sy[i]) + this.sx[i];
        py = s * (sx - this.sx[i]) + c * (sy - this.sy[i]) + this.sy[i];
        sx = px;
        sy = py;
      }
      width_in = Math.abs(this.sx[i] - sx) <= this.sw[i] / 2;
      height_in = Math.abs(this.sy[i] - sy) <= this.sh[i] / 2;
      if (height_in && width_in) {
        hits.push(i);
      }
    }
    result = hittest.create_hit_test_result();
    result['1d'].indices = hits;
    return result;
  };

  RectView.prototype.draw_legend_for_index = function(ctx, x0, x1, y0, y1, index) {
    return this._generic_area_legend(ctx, x0, x1, y0, y1, index);
  };

  RectView.prototype._bounds = function(bds) {
    return this.max_wh2_bounds(bds);
  };

  return RectView;

})(Glyph.View);

Rect = (function(superClass) {
  extend(Rect, superClass);

  function Rect() {
    return Rect.__super__.constructor.apply(this, arguments);
  }

  Rect.prototype.default_view = RectView;

  Rect.prototype.type = 'Rect';

  Rect.coords([['x', 'y']]);

  Rect.mixins(['line', 'fill']);

  Rect.define({
    angle: [p.AngleSpec, 0],
    width: [p.DistanceSpec],
    height: [p.DistanceSpec],
    dilate: [p.Bool, false]
  });

  return Rect;

})(Glyph.Model);

module.exports = {
  Model: Rect,
  View: RectView
};
