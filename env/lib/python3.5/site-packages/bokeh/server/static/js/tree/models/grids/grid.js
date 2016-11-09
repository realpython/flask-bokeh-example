var Grid, GridView, GuideRenderer, Renderer, _, p,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

GuideRenderer = require("../renderers/guide_renderer");

Renderer = require("../renderers/renderer");

p = require("../../core/properties");

GridView = (function(superClass) {
  extend(GridView, superClass);

  function GridView() {
    return GridView.__super__.constructor.apply(this, arguments);
  }

  GridView.prototype.initialize = function(attrs, options) {
    GridView.__super__.initialize.call(this, attrs, options);
    this._x_range_name = this.model.x_range_name;
    return this._y_range_name = this.model.y_range_name;
  };

  GridView.prototype.render = function() {
    var ctx;
    if (this.model.visible === false) {
      return;
    }
    ctx = this.plot_view.canvas_view.ctx;
    ctx.save();
    this._draw_regions(ctx);
    this._draw_minor_grids(ctx);
    this._draw_grids(ctx);
    return ctx.restore();
  };

  GridView.prototype.bind_bokeh_events = function() {
    return this.listenTo(this.model, 'change', this.request_render);
  };

  GridView.prototype._draw_regions = function(ctx) {
    var i, k, ref, ref1, ref2, ref3, sx0, sx1, sy0, sy1, xs, ys;
    if (!this.visuals.band_fill.doit) {
      return;
    }
    ref = this.model.grid_coords('major', false), xs = ref[0], ys = ref[1];
    this.visuals.band_fill.set_value(ctx);
    for (i = k = 0, ref1 = xs.length - 1; 0 <= ref1 ? k < ref1 : k > ref1; i = 0 <= ref1 ? ++k : --k) {
      if (i % 2 === 1) {
        ref2 = this.plot_view.map_to_screen(xs[i], ys[i], this._x_range_name, this._y_range_name), sx0 = ref2[0], sy0 = ref2[1];
        ref3 = this.plot_view.map_to_screen(xs[i + 1], ys[i + 1], this._x_range_name, this._y_range_name), sx1 = ref3[0], sy1 = ref3[1];
        ctx.fillRect(sx0[0], sy0[0], sx1[1] - sx0[0], sy1[1] - sy0[0]);
        ctx.fill();
      }
    }
  };

  GridView.prototype._draw_grids = function(ctx) {
    var ref, xs, ys;
    if (!this.visuals.grid_line.doit) {
      return;
    }
    ref = this.model.grid_coords('major'), xs = ref[0], ys = ref[1];
    return this._draw_grid_helper(ctx, this.visuals.grid_line, xs, ys);
  };

  GridView.prototype._draw_minor_grids = function(ctx) {
    var ref, xs, ys;
    if (!this.visuals.minor_grid_line.doit) {
      return;
    }
    ref = this.model.grid_coords('minor'), xs = ref[0], ys = ref[1];
    return this._draw_grid_helper(ctx, this.visuals.minor_grid_line, xs, ys);
  };

  GridView.prototype._draw_grid_helper = function(ctx, props, xs, ys) {
    var i, k, l, ref, ref1, ref2, sx, sy;
    props.set_value(ctx);
    for (i = k = 0, ref = xs.length; 0 <= ref ? k < ref : k > ref; i = 0 <= ref ? ++k : --k) {
      ref1 = this.plot_view.map_to_screen(xs[i], ys[i], this._x_range_name, this._y_range_name), sx = ref1[0], sy = ref1[1];
      ctx.beginPath();
      ctx.moveTo(Math.round(sx[0]), Math.round(sy[0]));
      for (i = l = 1, ref2 = sx.length; 1 <= ref2 ? l < ref2 : l > ref2; i = 1 <= ref2 ? ++l : --l) {
        ctx.lineTo(Math.round(sx[i]), Math.round(sy[i]));
      }
      ctx.stroke();
    }
  };

  return GridView;

})(Renderer.View);

Grid = (function(superClass) {
  extend(Grid, superClass);

  function Grid() {
    return Grid.__super__.constructor.apply(this, arguments);
  }

  Grid.prototype.default_view = GridView;

  Grid.prototype.type = 'Grid';

  Grid.mixins(['line:grid_', 'line:minor_grid_', 'fill:band_']);

  Grid.define({
    bounds: [p.Any, 'auto'],
    dimension: [p.Number, 0],
    ticker: [p.Instance],
    x_range_name: [p.String, 'default'],
    y_range_name: [p.String, 'default']
  });

  Grid.override({
    level: "underlay",
    band_fill_color: null,
    band_fill_alpha: 0,
    grid_line_color: '#e5e5e5',
    minor_grid_line_color: null
  });

  Grid.prototype.ranges = function() {
    var frame, i, j, ranges;
    i = this.dimension;
    j = (i + 1) % 2;
    frame = this.plot.plot_canvas.frame;
    ranges = [frame.x_ranges[this.x_range_name], frame.y_ranges[this.y_range_name]];
    return [ranges[i], ranges[j]];
  };

  Grid.prototype.computed_bounds = function() {
    var cross_range, end, range, range_bounds, ref, start, user_bounds;
    ref = this.ranges(), range = ref[0], cross_range = ref[1];
    user_bounds = this.bounds;
    range_bounds = [range.min, range.max];
    if (_.isArray(user_bounds)) {
      start = Math.min(user_bounds[0], user_bounds[1]);
      end = Math.max(user_bounds[0], user_bounds[1]);
      if (start < range_bounds[0]) {
        start = range_bounds[0];
      } else if (start > range_bounds[1]) {
        start = null;
      }
      if (end > range_bounds[1]) {
        end = range_bounds[1];
      } else if (end < range_bounds[0]) {
        end = null;
      }
    } else {
      start = range_bounds[0], end = range_bounds[1];
    }
    return [start, end];
  };

  Grid.prototype.grid_coords = function(location, exclude_ends) {
    var N, cmax, cmin, coords, cross_range, dim_i, dim_j, end, i, ii, j, k, l, loc, max, min, n, range, ref, ref1, ref2, ref3, start, ticks, tmp;
    if (exclude_ends == null) {
      exclude_ends = true;
    }
    i = this.dimension;
    j = (i + 1) % 2;
    ref = this.ranges(), range = ref[0], cross_range = ref[1];
    ref1 = this.computed_bounds(), start = ref1[0], end = ref1[1];
    tmp = Math.min(start, end);
    end = Math.max(start, end);
    start = tmp;
    ticks = this.ticker.get_ticks(start, end, range, {})[location];
    min = range.min;
    max = range.max;
    cmin = cross_range.min;
    cmax = cross_range.max;
    coords = [[], []];
    for (ii = k = 0, ref2 = ticks.length; 0 <= ref2 ? k < ref2 : k > ref2; ii = 0 <= ref2 ? ++k : --k) {
      if ((ticks[ii] === min || ticks[ii] === max) && exclude_ends) {
        continue;
      }
      dim_i = [];
      dim_j = [];
      N = 2;
      for (n = l = 0, ref3 = N; 0 <= ref3 ? l < ref3 : l > ref3; n = 0 <= ref3 ? ++l : --l) {
        loc = cmin + (cmax - cmin) / (N - 1) * n;
        dim_i.push(ticks[ii]);
        dim_j.push(loc);
      }
      coords[i].push(dim_i);
      coords[j].push(dim_j);
    }
    return coords;
  };

  return Grid;

})(GuideRenderer.Model);

module.exports = {
  Model: Grid,
  View: GridView
};
