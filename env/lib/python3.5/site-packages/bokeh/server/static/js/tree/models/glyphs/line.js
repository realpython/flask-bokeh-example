var Glyph, Line, LineView, _, hittest,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

Glyph = require("./glyph");

hittest = require("../../core/hittest");

LineView = (function(superClass) {
  extend(LineView, superClass);

  function LineView() {
    return LineView.__super__.constructor.apply(this, arguments);
  }

  LineView.prototype._index_data = function() {
    return this._xy_index();
  };

  LineView.prototype._render = function(ctx, indices, arg) {
    var drawing, i, j, len, sx, sy;
    sx = arg.sx, sy = arg.sy;
    drawing = false;
    this.visuals.line.set_value(ctx);
    for (j = 0, len = indices.length; j < len; j++) {
      i = indices[j];
      if (!isFinite(sx[i] + sy[i]) && drawing) {
        ctx.stroke();
        ctx.beginPath();
        drawing = false;
        continue;
      }
      if (drawing) {
        ctx.lineTo(sx[i], sy[i]);
      } else {
        ctx.beginPath();
        ctx.moveTo(sx[i], sy[i]);
        drawing = true;
      }
    }
    if (drawing) {
      return ctx.stroke();
    }
  };

  LineView.prototype._hit_point = function(geometry) {

    /* Check if the point geometry hits this line glyph and return an object
    that describes the hit result:
      Args:
        * geometry (object): object with the following keys
          * vx (float): view x coordinate of the point
          * vy (float): view y coordinate of the point
          * type (str): type of geometry (in this case it's a point)
      Output:
        Object with the following keys:
          * 0d (bool): whether the point hits the glyph or not
          * 1d (array(int)): array with the indices hit by the point
     */
    var dist, i, j, p0, p1, point, ref, ref1, result, shortest, threshold;
    result = hittest.create_hit_test_result();
    point = {
      x: this.renderer.plot_view.canvas.vx_to_sx(geometry.vx),
      y: this.renderer.plot_view.canvas.vy_to_sy(geometry.vy)
    };
    shortest = 9999;
    threshold = Math.max(2, this.visuals.line.line_width.value() / 2);
    for (i = j = 0, ref = this.sx.length - 1; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
      ref1 = [
        {
          x: this.sx[i],
          y: this.sy[i]
        }, {
          x: this.sx[i + 1],
          y: this.sy[i + 1]
        }
      ], p0 = ref1[0], p1 = ref1[1];
      dist = hittest.dist_to_segment(point, p0, p1);
      if (dist < threshold && dist < shortest) {
        shortest = dist;
        result['0d'].glyph = this.model;
        result['0d'].get_view = (function() {
          return this;
        }).bind(this);
        result['0d'].flag = true;
        result['0d'].indices = [i];
      }
    }
    return result;
  };

  LineView.prototype._hit_span = function(geometry) {
    var i, j, ref, ref1, result, val, values, vx, vy;
    ref = [geometry.vx, geometry.vy], vx = ref[0], vy = ref[1];
    result = hittest.create_hit_test_result();
    if (geometry.direction === 'v') {
      val = this.renderer.ymapper.map_from_target(vy);
      values = this._y;
    } else {
      val = this.renderer.xmapper.map_from_target(vx);
      values = this._x;
    }
    for (i = j = 0, ref1 = values.length - 1; 0 <= ref1 ? j < ref1 : j > ref1; i = 0 <= ref1 ? ++j : --j) {
      if ((values[i] <= val && val <= values[i + 1])) {
        result['0d'].glyph = this.model;
        result['0d'].get_view = (function() {
          return this;
        }).bind(this);
        result['0d'].flag = true;
        result['0d'].indices.push(i);
      }
    }
    return result;
  };

  LineView.prototype.get_interpolation_hit = function(i, geometry) {
    var ref, ref1, ref2, ref3, ref4, ref5, ref6, ref7, res, vx, vy, x0, x1, x2, x3, y0, y1, y2, y3;
    ref = [geometry.vx, geometry.vy], vx = ref[0], vy = ref[1];
    ref1 = [this._x[i], this._y[i], this._x[i + 1], this._y[i + 1]], x2 = ref1[0], y2 = ref1[1], x3 = ref1[2], y3 = ref1[3];
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

  LineView.prototype.draw_legend_for_index = function(ctx, x0, x1, y0, y1, index) {
    return this._generic_line_legend(ctx, x0, x1, y0, y1, index);
  };

  return LineView;

})(Glyph.View);

Line = (function(superClass) {
  extend(Line, superClass);

  function Line() {
    return Line.__super__.constructor.apply(this, arguments);
  }

  Line.prototype.default_view = LineView;

  Line.prototype.type = 'Line';

  Line.coords([['x', 'y']]);

  Line.mixins(['line']);

  return Line;

})(Glyph.Model);

module.exports = {
  Model: Line,
  View: LineView
};
