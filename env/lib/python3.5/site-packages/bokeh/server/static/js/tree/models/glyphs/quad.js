var CategoricalMapper, Glyph, Quad, QuadView, _, hittest, rbush,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

rbush = require("rbush");

Glyph = require("./glyph");

CategoricalMapper = require("../mappers/categorical_mapper");

hittest = require("../../core/hittest");

QuadView = (function(superClass) {
  extend(QuadView, superClass);

  function QuadView() {
    return QuadView.__super__.constructor.apply(this, arguments);
  }

  QuadView.prototype._index_data = function() {
    var b, bottom, i, index, j, l, left, map_to_synthetic, pts, r, ref, right, t, top;
    map_to_synthetic = function(mapper, array) {
      if (mapper instanceof CategoricalMapper.Model) {
        return mapper.v_map_to_target(array, true);
      } else {
        return array;
      }
    };
    left = map_to_synthetic(this.renderer.xmapper, this._left);
    right = map_to_synthetic(this.renderer.xmapper, this._right);
    top = map_to_synthetic(this.renderer.ymapper, this._top);
    bottom = map_to_synthetic(this.renderer.ymapper, this._bottom);
    index = rbush();
    pts = [];
    for (i = j = 0, ref = left.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
      l = left[i];
      r = right[i];
      t = top[i];
      b = bottom[i];
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

  QuadView.prototype._render = function(ctx, indices, arg) {
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

  QuadView.prototype._hit_point = function(geometry) {
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

  QuadView.prototype.get_anchor_point = function(anchor, i, spt) {
    var bottom, left, right, top;
    left = Math.min(this.sleft[i], this.sright[i]);
    right = Math.max(this.sright[i], this.sleft[i]);
    top = Math.min(this.stop[i], this.sbottom[i]);
    bottom = Math.max(this.sbottom[i], this.stop[i]);
    switch (anchor) {
      case "top_left":
        return {
          x: left,
          y: top
        };
      case "top_center":
        return {
          x: (left + right) / 2,
          y: top
        };
      case "top_right":
        return {
          x: right,
          y: top
        };
      case "right_center":
        return {
          x: right,
          y: (top + bottom) / 2
        };
      case "bottom_right":
        return {
          x: right,
          y: bottom
        };
      case "bottom_center":
        return {
          x: (left + right) / 2,
          y: bottom
        };
      case "bottom_left":
        return {
          x: left,
          y: bottom
        };
      case "left_center":
        return {
          x: left,
          y: (top + bottom) / 2
        };
      case "center":
        return {
          x: (left + right) / 2,
          y: (top + bottom) / 2
        };
    }
  };

  QuadView.prototype.scx = function(i) {
    return (this.sleft[i] + this.sright[i]) / 2;
  };

  QuadView.prototype.scy = function(i) {
    return (this.stop[i] + this.sbottom[i]) / 2;
  };

  QuadView.prototype.draw_legend_for_index = function(ctx, x0, x1, y0, y1, index) {
    return this._generic_area_legend(ctx, x0, x1, y0, y1, index);
  };

  return QuadView;

})(Glyph.View);

Quad = (function(superClass) {
  extend(Quad, superClass);

  function Quad() {
    return Quad.__super__.constructor.apply(this, arguments);
  }

  Quad.prototype.default_view = QuadView;

  Quad.prototype.type = 'Quad';

  Quad.coords([['right', 'bottom'], ['left', 'top']]);

  Quad.mixins(['line', 'fill']);

  return Quad;

})(Glyph.Model);

module.exports = {
  Model: Quad,
  View: QuadView
};
