var Label, LabelView, TextAnnotation, p,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

TextAnnotation = require("./text_annotation");

p = require("../../core/properties");

LabelView = (function(superClass) {
  extend(LabelView, superClass);

  function LabelView() {
    return LabelView.__super__.constructor.apply(this, arguments);
  }

  LabelView.prototype.initialize = function(options) {
    LabelView.__super__.initialize.call(this, options);
    this.canvas = this.plot_model.canvas;
    this.xmapper = this.plot_view.frame.x_mappers[this.model.x_range_name];
    this.ymapper = this.plot_view.frame.y_mappers[this.model.y_range_name];
    return this.visuals.warm_cache(null);
  };

  LabelView.prototype._get_size = function() {
    var ctx, height, side, width;
    ctx = this.plot_view.canvas_view.ctx;
    this.visuals.text.set_value(ctx);
    side = this.model.panel.side;
    if (side === "above" || side === "below") {
      height = ctx.measureText(this.model.text).ascent;
      return height;
    }
    if (side === 'left' || side === 'right') {
      width = ctx.measureText(this.model.text).width;
      return width;
    }
  };

  LabelView.prototype.render = function() {
    var angle, ctx, panel_offset, sx, sy, vx, vy;
    ctx = this.plot_view.canvas_view.ctx;
    switch (this.model.angle_units) {
      case "rad":
        angle = -1 * this.model.angle;
        break;
      case "deg":
        angle = -1 * this.model.angle * Math.PI / 180.0;
    }
    if (this.model.x_units === "data") {
      vx = this.xmapper.map_to_target(this.model.x);
    } else {
      vx = this.model.x;
    }
    sx = this.canvas.vx_to_sx(vx);
    if (this.model.y_units === "data") {
      vy = this.ymapper.map_to_target(this.model.y);
    } else {
      vy = this.model.y;
    }
    sy = this.canvas.vy_to_sy(vy);
    if (this.model.panel != null) {
      panel_offset = this._get_panel_offset();
      sx += panel_offset.x;
      sy += panel_offset.y;
    }
    if (this.model.render_mode === 'canvas') {
      return this._canvas_text(ctx, this.model.text, sx + this.model.x_offset, sy - this.model.y_offset, angle);
    } else {
      return this._css_text(ctx, this.model.text, sx + this.model.x_offset, sy - this.model.y_offset, angle);
    }
  };

  return LabelView;

})(TextAnnotation.View);

Label = (function(superClass) {
  extend(Label, superClass);

  function Label() {
    return Label.__super__.constructor.apply(this, arguments);
  }

  Label.prototype.default_view = LabelView;

  Label.prototype.type = 'Label';

  Label.mixins(['text', 'line:border_', 'fill:background_']);

  Label.define({
    x: [p.Number],
    x_units: [p.SpatialUnits, 'data'],
    y: [p.Number],
    y_units: [p.SpatialUnits, 'data'],
    text: [p.String],
    angle: [p.Angle, 0],
    angle_units: [p.AngleUnits, 'rad'],
    x_offset: [p.Number, 0],
    y_offset: [p.Number, 0],
    x_range_name: [p.String, 'default'],
    y_range_name: [p.String, 'default'],
    render_mode: [p.RenderMode, 'canvas']
  });

  Label.override({
    background_fill_color: null,
    border_line_color: null
  });

  return Label;

})(TextAnnotation.Model);

module.exports = {
  Model: Label,
  View: LabelView
};
