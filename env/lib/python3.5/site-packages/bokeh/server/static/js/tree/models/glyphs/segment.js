var Glyph, Segment, SegmentView, _, rbush,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

rbush = require("rbush");

Glyph = require("./glyph");

SegmentView = (function(superClass) {
  extend(SegmentView, superClass);

  function SegmentView() {
    return SegmentView.__super__.constructor.apply(this, arguments);
  }

  SegmentView.prototype._index_data = function() {
    var i, index, j, pts, ref;
    index = rbush();
    pts = [];
    for (i = j = 0, ref = this._x0.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
      if (!isNaN(this._x0[i] + this._x1[i] + this._y0[i] + this._y1[i])) {
        pts.push({
          minX: Math.min(this._x0[i], this._x1[i]),
          minY: Math.min(this._y0[i], this._y1[i]),
          maxX: Math.max(this._x0[i], this._x1[i]),
          maxY: Math.max(this._y0[i], this._y1[i]),
          i: i
        });
      }
    }
    index.load(pts);
    return index;
  };

  SegmentView.prototype._render = function(ctx, indices, arg) {
    var i, j, len, results, sx0, sx1, sy0, sy1;
    sx0 = arg.sx0, sy0 = arg.sy0, sx1 = arg.sx1, sy1 = arg.sy1;
    if (this.visuals.line.doit) {
      results = [];
      for (j = 0, len = indices.length; j < len; j++) {
        i = indices[j];
        if (isNaN(sx0[i] + sy0[i] + sx1[i] + sy1[i])) {
          continue;
        }
        ctx.beginPath();
        ctx.moveTo(sx0[i], sy0[i]);
        ctx.lineTo(sx1[i], sy1[i]);
        this.visuals.line.set_vectorize(ctx, i);
        results.push(ctx.stroke());
      }
      return results;
    }
  };

  SegmentView.prototype.draw_legend_for_index = function(ctx, x0, x1, y0, y1, index) {
    return this._generic_line_legend(ctx, x0, x1, y0, y1, index);
  };

  return SegmentView;

})(Glyph.View);

Segment = (function(superClass) {
  extend(Segment, superClass);

  function Segment() {
    return Segment.__super__.constructor.apply(this, arguments);
  }

  Segment.prototype.default_view = SegmentView;

  Segment.prototype.type = 'Segment';

  Segment.coords([['x0', 'y0'], ['x1', 'y1']]);

  Segment.mixins(['line']);

  return Segment;

})(Glyph.Model);

module.exports = {
  Model: Segment,
  View: SegmentView
};
