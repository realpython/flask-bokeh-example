var Bezier, BezierView, Glyph, _, _cbb, rbush,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

rbush = require("rbush");

Glyph = require("./glyph");

_cbb = function(x0, y0, x1, y1, x2, y2, x3, y3) {
  var a, b, b2ac, bounds, c, i, j, jlen, k, mt, sqrtb2ac, t, t1, t2, tvalues, x, y;
  tvalues = [];
  bounds = [[], []];
  for (i = k = 0; k <= 2; i = ++k) {
    if (i === 0) {
      b = 6 * x0 - 12 * x1 + 6 * x2;
      a = -3 * x0 + 9 * x1 - 9 * x2 + 3 * x3;
      c = 3 * x1 - 3 * x0;
    } else {
      b = 6 * y0 - 12 * y1 + 6 * y2;
      a = -3 * y0 + 9 * y1 - 9 * y2 + 3 * y3;
      c = 3 * y1 - 3 * y0;
    }
    if (Math.abs(a) < 1e-12) {
      if (Math.abs(b) < 1e-12) {
        continue;
      }
      t = -c / b;
      if (0 < t && t < 1) {
        tvalues.push(t);
      }
      continue;
    }
    b2ac = b * b - 4 * c * a;
    sqrtb2ac = Math.sqrt(b2ac);
    if (b2ac < 0) {
      continue;
    }
    t1 = (-b + sqrtb2ac) / (2 * a);
    if (0 < t1 && t1 < 1) {
      tvalues.push(t1);
    }
    t2 = (-b - sqrtb2ac) / (2 * a);
    if (0 < t2 && t2 < 1) {
      tvalues.push(t2);
    }
  }
  j = tvalues.length;
  jlen = j;
  while (j--) {
    t = tvalues[j];
    mt = 1 - t;
    x = (mt * mt * mt * x0) + (3 * mt * mt * t * x1) + (3 * mt * t * t * x2) + (t * t * t * x3);
    bounds[0][j] = x;
    y = (mt * mt * mt * y0) + (3 * mt * mt * t * y1) + (3 * mt * t * t * y2) + (t * t * t * y3);
    bounds[1][j] = y;
  }
  bounds[0][jlen] = x0;
  bounds[1][jlen] = y0;
  bounds[0][jlen + 1] = x3;
  bounds[1][jlen + 1] = y3;
  return [Math.min.apply(null, bounds[0]), Math.max.apply(null, bounds[1]), Math.max.apply(null, bounds[0]), Math.min.apply(null, bounds[1])];
};

BezierView = (function(superClass) {
  extend(BezierView, superClass);

  function BezierView() {
    return BezierView.__super__.constructor.apply(this, arguments);
  }

  BezierView.prototype._index_data = function() {
    var i, index, k, pts, ref, ref1, x0, x1, y0, y1;
    index = rbush();
    pts = [];
    for (i = k = 0, ref = this._x0.length; 0 <= ref ? k < ref : k > ref; i = 0 <= ref ? ++k : --k) {
      if (isNaN(this._x0[i] + this._x1[i] + this._y0[i] + this._y1[i] + this._cx0[i] + this._cy0[i] + this._cx1[i] + this._cy1[i])) {
        continue;
      }
      ref1 = _cbb(this._x0[i], this._y0[i], this._x1[i], this._y1[i], this._cx0[i], this._cy0[i], this._cx1[i], this._cy1[i]), x0 = ref1[0], y0 = ref1[1], x1 = ref1[2], y1 = ref1[3];
      pts.push({
        minX: x0,
        minY: y0,
        maxX: x1,
        maxY: y1,
        i: i
      });
    }
    index.load(pts);
    return index;
  };

  BezierView.prototype._render = function(ctx, indices, arg) {
    var i, k, len, results, scx, scx0, scx1, scy0, scy1, sx0, sx1, sy0, sy1;
    sx0 = arg.sx0, sy0 = arg.sy0, sx1 = arg.sx1, sy1 = arg.sy1, scx = arg.scx, scx0 = arg.scx0, scy0 = arg.scy0, scx1 = arg.scx1, scy1 = arg.scy1;
    if (this.visuals.line.doit) {
      results = [];
      for (k = 0, len = indices.length; k < len; k++) {
        i = indices[k];
        if (isNaN(sx0[i] + sy0[i] + sx1[i] + sy1[i] + scx0[i] + scy0[i] + scx1[i] + scy1[i])) {
          continue;
        }
        ctx.beginPath();
        ctx.moveTo(sx0[i], sy0[i]);
        ctx.bezierCurveTo(scx0[i], scy0[i], scx1[i], scy1[i], sx1[i], sy1[i]);
        this.visuals.line.set_vectorize(ctx, i);
        results.push(ctx.stroke());
      }
      return results;
    }
  };

  BezierView.prototype.draw_legend_for_index = function(ctx, x0, x1, y0, y1, index) {
    return this._generic_line_legend(ctx, x0, x1, y0, y1, index);
  };

  return BezierView;

})(Glyph.View);

Bezier = (function(superClass) {
  extend(Bezier, superClass);

  function Bezier() {
    return Bezier.__super__.constructor.apply(this, arguments);
  }

  Bezier.prototype.default_view = BezierView;

  Bezier.prototype.type = 'Bezier';

  Bezier.coords([['x0', 'y0'], ['x1', 'y1'], ['cx0', 'cy0'], ['cx1', 'cy1']]);

  Bezier.mixins(['line']);

  return Bezier;

})(Glyph.Model);

module.exports = {
  Model: Bezier,
  View: BezierView
};
