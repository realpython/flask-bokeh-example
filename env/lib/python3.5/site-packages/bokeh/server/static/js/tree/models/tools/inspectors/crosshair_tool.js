var CrosshairTool, CrosshairToolView, InspectTool, Span, _, p,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

InspectTool = require("./inspect_tool");

Span = require("../../annotations/span");

p = require("../../../core/properties");

CrosshairToolView = (function(superClass) {
  extend(CrosshairToolView, superClass);

  function CrosshairToolView() {
    return CrosshairToolView.__super__.constructor.apply(this, arguments);
  }

  CrosshairToolView.prototype._move = function(e) {
    var canvas, frame, vx, vy;
    if (!this.model.active) {
      return;
    }
    frame = this.plot_model.frame;
    canvas = this.plot_model.canvas;
    vx = canvas.sx_to_vx(e.bokeh.sx);
    vy = canvas.sy_to_vy(e.bokeh.sy);
    if (!frame.contains(vx, vy)) {
      vx = vy = null;
    }
    return this._update_spans(vx, vy);
  };

  CrosshairToolView.prototype._move_exit = function(e) {
    return this._update_spans(null, null);
  };

  CrosshairToolView.prototype._update_spans = function(x, y) {
    var dims;
    dims = this.model.dimensions;
    if (dims === 'width' || dims === 'both') {
      this.model.spans.width.computed_location = y;
    }
    if (dims === 'height' || dims === 'both') {
      return this.model.spans.height.computed_location = x;
    }
  };

  return CrosshairToolView;

})(InspectTool.View);

CrosshairTool = (function(superClass) {
  extend(CrosshairTool, superClass);

  function CrosshairTool() {
    return CrosshairTool.__super__.constructor.apply(this, arguments);
  }

  CrosshairTool.prototype.default_view = CrosshairToolView;

  CrosshairTool.prototype.type = "CrosshairTool";

  CrosshairTool.prototype.tool_name = "Crosshair";

  CrosshairTool.define({
    dimensions: [p.Dimensions, "both"],
    line_color: [p.Color, 'black'],
    line_width: [p.Number, 1],
    line_alpha: [p.Number, 1.0]
  });

  CrosshairTool.internal({
    location_units: [p.SpatialUnits, "screen"],
    render_mode: [p.RenderMode, "css"],
    spans: [p.Any]
  });

  CrosshairTool.getters({
    tooltip: function() {
      return this._get_dim_tooltip("Crosshair", this.dimensions);
    },
    synthetic_renderers: function() {
      return _.values(this.spans);
    }
  });

  CrosshairTool.prototype.initialize = function(attrs, options) {
    CrosshairTool.__super__.initialize.call(this, attrs, options);
    return this.spans = {
      width: new Span.Model({
        for_hover: true,
        dimension: "width",
        render_mode: this.render_mode,
        location_units: this.location_units,
        line_color: this.line_color,
        line_width: this.line_width,
        line_alpha: this.line_alpha
      }),
      height: new Span.Model({
        for_hover: true,
        dimension: "height",
        render_mode: this.render_mode,
        location_units: this.location_units,
        line_color: this.line_color,
        line_width: this.line_width,
        line_alpha: this.line_alpha
      })
    };
  };

  return CrosshairTool;

})(InspectTool.Model);

module.exports = {
  Model: CrosshairTool,
  View: CrosshairToolView
};
