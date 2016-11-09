var Annotation, PolyAnnotation, PolyAnnotationView, _, p,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

Annotation = require("./annotation");

p = require("../../core/properties");

PolyAnnotationView = (function(superClass) {
  extend(PolyAnnotationView, superClass);

  function PolyAnnotationView() {
    return PolyAnnotationView.__super__.constructor.apply(this, arguments);
  }

  PolyAnnotationView.prototype.bind_bokeh_events = function() {
    this.listenTo(this.model, 'change', this.plot_view.request_render);
    return this.listenTo(this.model, 'data_update', this.plot_view.request_render);
  };

  PolyAnnotationView.prototype.render = function(ctx) {
    var canvas, i, j, ref, sx, sy, vx, vy, xs, ys;
    xs = this.model.xs;
    ys = this.model.ys;
    if (xs.length !== ys.length) {
      return null;
    }
    if (xs.length < 3 || ys.length < 3) {
      return null;
    }
    canvas = this.plot_view.canvas;
    ctx = this.plot_view.canvas_view.ctx;
    for (i = j = 0, ref = xs.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
      if (this.model.xs_units === 'screen') {
        vx = xs[i];
      }
      if (this.model.ys_units === 'screen') {
        vy = ys[i];
      }
      sx = canvas.vx_to_sx(vx);
      sy = canvas.vy_to_sy(vy);
      if (i === 0) {
        ctx.beginPath();
        ctx.moveTo(sx, sy);
      } else {
        ctx.lineTo(sx, sy);
      }
    }
    ctx.closePath();
    if (this.visuals.line.doit) {
      this.visuals.line.set_value(ctx);
      ctx.stroke();
    }
    if (this.visuals.fill.doit) {
      this.visuals.fill.set_value(ctx);
      return ctx.fill();
    }
  };

  return PolyAnnotationView;

})(Annotation.View);

PolyAnnotation = (function(superClass) {
  extend(PolyAnnotation, superClass);

  function PolyAnnotation() {
    return PolyAnnotation.__super__.constructor.apply(this, arguments);
  }

  PolyAnnotation.prototype.default_view = PolyAnnotationView;

  PolyAnnotation.prototype.type = "PolyAnnotation";

  PolyAnnotation.mixins(['line', 'fill']);

  PolyAnnotation.define({
    xs: [p.Array, []],
    xs_units: [p.SpatialUnits, 'data'],
    ys: [p.Array, []],
    ys_units: [p.SpatialUnits, 'data'],
    x_range_name: [p.String, 'default'],
    y_range_name: [p.String, 'default']
  });

  PolyAnnotation.override({
    fill_color: "#fff9ba",
    fill_alpha: 0.4,
    line_color: "#cccccc",
    line_alpha: 0.3
  });

  PolyAnnotation.prototype.update = function(arg) {
    var xs, ys;
    xs = arg.xs, ys = arg.ys;
    this.setv({
      xs: xs,
      ys: ys
    }, {
      silent: true
    });
    return this.trigger('data_update');
  };

  return PolyAnnotation;

})(Annotation.Model);

module.exports = {
  Model: PolyAnnotation,
  View: PolyAnnotationView
};
