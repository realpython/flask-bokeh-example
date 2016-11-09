var CategoricalMapper, Glyph, HBar, HBarView, Quad, _, hittest, p, rbush,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

rbush = require("rbush");

Quad = require("./quad");

Glyph = require("./glyph");

CategoricalMapper = require("../mappers/categorical_mapper");

hittest = require("../../core/hittest");

p = require("../../core/properties");

HBarView = (function(superClass) {
  extend(HBarView, superClass);

  function HBarView() {
    return HBarView.__super__.constructor.apply(this, arguments);
  }

  HBarView.prototype._map_data = function() {
    var i, j, ref, vleft, vright, vy;
    vy = this.renderer.ymapper.v_map_to_target(this._y);
    this.sy = this.renderer.plot_view.canvas.v_vy_to_sy(vy);
    vright = this.renderer.xmapper.v_map_to_target(this._right);
    vleft = this.renderer.xmapper.v_map_to_target(this._left);
    this.sright = this.renderer.plot_view.canvas.v_vx_to_sx(vright);
    this.sleft = this.renderer.plot_view.canvas.v_vx_to_sx(vleft);
    this.stop = [];
    this.sbottom = [];
    this.sh = this.sdist(this.renderer.ymapper, this._y, this._height, 'center');
    for (i = j = 0, ref = this.sy.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
      this.stop.push(this.sy[i] - this.sh[i] / 2);
      this.sbottom.push(this.sy[i] + this.sh[i] / 2);
    }
    return null;
  };

  HBarView.prototype._index_data = function() {
    var b, height, i, index, j, l, left, map_to_synthetic, pts, r, ref, right, t, y;
    map_to_synthetic = function(mapper, array) {
      if (mapper instanceof CategoricalMapper.Model) {
        return mapper.v_map_to_target(array, true);
      } else {
        return array;
      }
    };
    left = map_to_synthetic(this.renderer.xmapper, this._left);
    right = map_to_synthetic(this.renderer.xmapper, this._right);
    y = map_to_synthetic(this.renderer.ymapper, this._y);
    height = map_to_synthetic(this.renderer.ymapper, this._height);
    index = rbush();
    pts = [];
    for (i = j = 0, ref = y.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
      l = left[i];
      r = right[i];
      t = y[i] + 0.5 * height[i];
      b = y[i] - 0.5 * height[i];
      if (isNaN(l + r + t + b) || !isFinite(l + r + t + b)) {
        continue;
      }
      pts.push({
        minX: l,
        minY: b,
        maxX: r,
        maxY: t,
        i: i
      });
    }
    index.load(pts);
    return index;
  };

  HBarView.prototype._render = function(ctx, indices, arg) {
    var i, j, len, results, sbottom, sleft, sright, stop;
    sleft = arg.sleft, sright = arg.sright, stop = arg.stop, sbottom = arg.sbottom;
    results = [];
    for (j = 0, len = indices.length; j < len; j++) {
      i = indices[j];
      if (isNaN(sleft[i] + stop[i] + sright[i] + sbottom[i])) {
        continue;
      }
      if (this.visuals.fill.doit) {
        this.visuals.fill.set_vectorize(ctx, i);
        ctx.fillRect(sleft[i], stop[i], sright[i] - sleft[i], sbottom[i] - stop[i]);
      }
      if (this.visuals.line.doit) {
        ctx.beginPath();
        ctx.rect(sleft[i], stop[i], sright[i] - sleft[i], sbottom[i] - stop[i]);
        this.visuals.line.set_vectorize(ctx, i);
        results.push(ctx.stroke());
      } else {
        results.push(void 0);
      }
    }
    return results;
  };

  HBarView.prototype._hit_point = function(geometry) {
    var hits, ref, result, vx, vy, x, y;
    ref = [geometry.vx, geometry.vy], vx = ref[0], vy = ref[1];
    x = this.renderer.xmapper.map_from_target(vx, true);
    y = this.renderer.ymapper.map_from_target(vy, true);
    hits = (function() {
      var j, len, ref1, results;
      ref1 = this.index.search({
        minX: x,
        minY: y,
        maxX: x,
        maxY: y
      });
      results = [];
      for (j = 0, len = ref1.length; j < len; j++) {
        x = ref1[j];
        results.push(x.i);
      }
      return results;
    }).call(this);
    result = hittest.create_hit_test_result();
    result['1d'].indices = hits;
    return result;
  };

  HBarView.prototype.scx = function(i) {
    return (this.sleft[i] + this.sright[i]) / 2;
  };

  HBarView.prototype.draw_legend_for_index = function(ctx, x0, x1, y0, y1, index) {
    return this._generic_area_legend(ctx, x0, x1, y0, y1, index);
  };

  return HBarView;

})(Glyph.View);

HBar = (function(superClass) {
  extend(HBar, superClass);

  function HBar() {
    return HBar.__super__.constructor.apply(this, arguments);
  }

  HBar.prototype.default_view = HBarView;

  HBar.prototype.type = 'HBar';

  HBar.mixins(['line', 'fill']);

  HBar.define({
    y: [p.NumberSpec],
    height: [p.DistanceSpec],
    left: [p.NumberSpec, 0],
    right: [p.NumberSpec]
  });

  return HBar;

})(Glyph.Model);

module.exports = {
  Model: HBar,
  View: HBarView
};
