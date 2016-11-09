var Annotation, Span, SpanView, _, p,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

Annotation = require("./annotation");

p = require("../../core/properties");

SpanView = (function(superClass) {
  extend(SpanView, superClass);

  function SpanView() {
    return SpanView.__super__.constructor.apply(this, arguments);
  }

  SpanView.prototype.initialize = function(options) {
    SpanView.__super__.initialize.call(this, options);
    this.$el.appendTo(this.plot_view.$el.find('div.bk-canvas-overlays'));
    this.$el.css({
      position: 'absolute'
    });
    return this.$el.hide();
  };

  SpanView.prototype.bind_bokeh_events = function() {
    if (this.model.for_hover) {
      return this.listenTo(this.model, 'change:computed_location', this._draw_span);
    } else {
      if (this.model.render_mode === 'canvas') {
        return this.listenTo(this.model, 'change:location', this.plot_view.request_render);
      } else {
        return this.listenTo(this.model, 'change:location', this._draw_span);
      }
    }
  };

  SpanView.prototype.render = function() {
    return this._draw_span();
  };

  SpanView.prototype._draw_span = function() {
    var canvas, ctx, frame, height, loc, sleft, stop, width, xmapper, ymapper;
    if (this.model.for_hover) {
      loc = this.model.computed_location;
    } else {
      loc = this.model.location;
    }
    if (loc == null) {
      this.$el.hide();
      return;
    }
    frame = this.plot_model.frame;
    canvas = this.plot_model.canvas;
    xmapper = this.plot_view.frame.x_mappers[this.model.x_range_name];
    ymapper = this.plot_view.frame.y_mappers[this.model.y_range_name];
    if (this.model.dimension === 'width') {
      stop = canvas.vy_to_sy(this._calc_dim(loc, ymapper));
      sleft = canvas.vx_to_sx(frame.left);
      width = frame.width;
      height = this.model.properties.line_width.value();
    } else {
      stop = canvas.vy_to_sy(frame.top);
      sleft = canvas.vx_to_sx(this._calc_dim(loc, xmapper));
      width = this.model.properties.line_width.value();
      height = frame.height;
    }
    if (this.model.render_mode === "css") {
      this.$el.css({
        'top': stop,
        'left': sleft,
        'width': width + "px",
        'height': height + "px",
        'z-index': 1000,
        'background-color': this.model.properties.line_color.value(),
        'opacity': this.model.properties.line_alpha.value()
      });
      return this.$el.show();
    } else if (this.model.render_mode === "canvas") {
      ctx = this.plot_view.canvas_view.ctx;
      ctx.save();
      ctx.beginPath();
      this.visuals.line.set_value(ctx);
      ctx.moveTo(sleft, stop);
      if (this.model.dimension === "width") {
        ctx.lineTo(sleft + width, stop);
      } else {
        ctx.lineTo(sleft, stop + height);
      }
      ctx.stroke();
      return ctx.restore();
    }
  };

  SpanView.prototype._calc_dim = function(location, mapper) {
    var vdim;
    if (this.model.location_units === 'data') {
      vdim = mapper.map_to_target(location);
    } else {
      vdim = location;
    }
    return vdim;
  };

  return SpanView;

})(Annotation.View);

Span = (function(superClass) {
  extend(Span, superClass);

  function Span() {
    return Span.__super__.constructor.apply(this, arguments);
  }

  Span.prototype.default_view = SpanView;

  Span.prototype.type = 'Span';

  Span.mixins(['line']);

  Span.define({
    render_mode: [p.RenderMode, 'canvas'],
    x_range_name: [p.String, 'default'],
    y_range_name: [p.String, 'default'],
    location: [p.Number, null],
    location_units: [p.SpatialUnits, 'data'],
    dimension: [p.Dimension, 'width']
  });

  Span.override({
    line_color: 'black'
  });

  Span.internal({
    for_hover: [p.Boolean, false],
    computed_location: [p.Number, null]
  });

  return Span;

})(Annotation.Model);

module.exports = {
  Model: Span,
  View: SpanView
};
