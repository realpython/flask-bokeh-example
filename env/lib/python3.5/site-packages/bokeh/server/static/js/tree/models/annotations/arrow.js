var Annotation, Arrow, ArrowView, ColumnDataSource, OpenHead, _, atan2, p,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

Annotation = require("./annotation");

OpenHead = require("./arrow_head").OpenHead;

ColumnDataSource = require("../sources/column_data_source");

p = require("../../core/properties");

atan2 = require("../../core/util/math").atan2;

ArrowView = (function(superClass) {
  extend(ArrowView, superClass);

  function ArrowView() {
    return ArrowView.__super__.constructor.apply(this, arguments);
  }

  ArrowView.prototype.initialize = function(options) {
    ArrowView.__super__.initialize.call(this, options);
    if (this.model.source == null) {
      this.model.source = new ColumnDataSource.Model();
    }
    this.canvas = this.plot_model.canvas;
    this.xmapper = this.plot_view.frame.x_mappers[this.model.x_range_name];
    this.ymapper = this.plot_view.frame.y_mappers[this.model.y_range_name];
    return this.set_data(this.model.source);
  };

  ArrowView.prototype.bind_bokeh_events = function() {
    this.listenTo(this.model, 'change', this.plot_view.request_render);
    return this.listenTo(this.model.source, 'change', function() {
      this.set_data(this.model.source);
      return this.plot_view.request_render();
    });
  };

  ArrowView.prototype.set_data = function(source) {
    ArrowView.__super__.set_data.call(this, source);
    return this.visuals.warm_cache(source);
  };

  ArrowView.prototype._map_data = function() {
    var end, start, x_name, y_name;
    if (this.model.start_units === 'data') {
      start = this.plot_view.map_to_screen(this._x_start, this._y_start, x_name = this.model.x_range_name, y_name = this.model.y_range_name);
    } else {
      start = [this.canvas.v_vx_to_sx(this._x_start), this.canvas.v_vy_to_sy(this._y_start)];
    }
    if (this.model.end_units === 'data') {
      end = this.plot_view.map_to_screen(this._x_end, this._y_end, x_name = this.model.x_range_name, y_name = this.model.y_range_name);
    } else {
      end = [this.canvas.v_vx_to_sx(this._x_end), this.canvas.v_vy_to_sy(this._y_end)];
    }
    return [start, end];
  };

  ArrowView.prototype.render = function() {
    var ref;
    ref = this._map_data(), this.start = ref[0], this.end = ref[1];
    this._draw_arrow_body();
    if (this.model.end != null) {
      this._draw_arrow_head(this.model.end, this.start, this.end);
    }
    if (this.model.start != null) {
      return this._draw_arrow_head(this.model.start, this.end, this.start);
    }
  };

  ArrowView.prototype._draw_arrow_body = function() {
    var ctx, i, j, ref;
    ctx = this.plot_view.canvas_view.ctx;
    ctx.save();
    for (i = j = 0, ref = this._x_start.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
      this.visuals.line.set_vectorize(ctx, i);
      ctx.beginPath();
      ctx.moveTo(this.start[0][i], this.start[1][i]);
      ctx.lineTo(this.end[0][i], this.end[1][i]);
      if (this.visuals.line.doit) {
        ctx.stroke();
      }
    }
    return ctx.restore();
  };

  ArrowView.prototype._draw_arrow_head = function(head, start, end) {
    var angle, ctx, i, j, ref, results;
    ctx = this.plot_view.canvas_view.ctx;
    results = [];
    for (i = j = 0, ref = this._x_start.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
      angle = Math.PI / 2 + atan2([start[0][i], start[1][i]], [end[0][i], end[1][i]]);
      ctx.save();
      ctx.translate(end[0][i], end[1][i]);
      ctx.rotate(angle);
      head.render(ctx, i);
      results.push(ctx.restore());
    }
    return results;
  };

  return ArrowView;

})(Annotation.View);

Arrow = (function(superClass) {
  extend(Arrow, superClass);

  function Arrow() {
    return Arrow.__super__.constructor.apply(this, arguments);
  }

  Arrow.prototype.default_view = ArrowView;

  Arrow.prototype.type = 'Arrow';

  Arrow.mixins(['line']);

  Arrow.define({
    x_start: [p.NumberSpec],
    y_start: [p.NumberSpec],
    start_units: [p.String, 'data'],
    start: [p.Instance, null],
    x_end: [p.NumberSpec],
    y_end: [p.NumberSpec],
    end_units: [p.String, 'data'],
    end: [p.Instance, new OpenHead.Model({})],
    source: [p.Instance],
    x_range_name: [p.String, 'default'],
    y_range_name: [p.String, 'default']
  });

  return Arrow;

})(Annotation.Model);

module.exports = {
  Model: Arrow,
  View: ArrowView
};
