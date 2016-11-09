var TextAnnotation, Title, TitleView, Visuals, p,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

TextAnnotation = require("./text_annotation");

p = require("../../core/properties");

Visuals = require("../../core/visuals");

TitleView = (function(superClass) {
  extend(TitleView, superClass);

  function TitleView() {
    return TitleView.__super__.constructor.apply(this, arguments);
  }

  TitleView.prototype.initialize = function(options) {
    var ctx;
    TitleView.__super__.initialize.call(this, options);
    this.visuals.text = new Visuals.Text(this.model);
    ctx = this.plot_view.canvas_view.ctx;
    ctx.save();
    this.model.panel.apply_label_text_heuristics(ctx, 'justified');
    this.model.text_baseline = ctx.textBaseline;
    this.model.text_align = this.model.align;
    return ctx.restore();
  };

  TitleView.prototype._get_computed_location = function() {
    var height, ref, sx, sy, vx, vy, width;
    ref = this._calculate_text_dimensions(this.plot_view.canvas_view.ctx, this.text), width = ref[0], height = ref[1];
    switch (this.model.panel.side) {
      case 'left':
        vx = 0;
        vy = this._get_text_location(this.model.align, this.frame.v_range) + this.model.offset;
        break;
      case 'right':
        vx = this.canvas.right - 1;
        vy = this.canvas.height - this._get_text_location(this.model.align, this.frame.v_range) - this.model.offset;
        break;
      case 'above':
        vx = this._get_text_location(this.model.align, this.frame.h_range) + this.model.offset;
        vy = this.canvas.top - 10;
        break;
      case 'below':
        vx = this._get_text_location(this.model.align, this.frame.h_range) + this.model.offset;
        vy = 0;
    }
    sx = this.canvas.vx_to_sx(vx);
    sy = this.canvas.vy_to_sy(vy);
    return [sx, sy];
  };

  TitleView.prototype._get_text_location = function(alignment, range) {
    var text_location;
    switch (alignment) {
      case 'left':
        text_location = range.start;
        break;
      case 'center':
        text_location = (range.end + range.start) / 2;
        break;
      case 'right':
        text_location = range.end;
    }
    return text_location;
  };

  TitleView.prototype.render = function() {
    var angle, ctx, ref, sx, sy;
    angle = this.model.panel.get_label_angle_heuristic('parallel');
    ref = this._get_computed_location(), sx = ref[0], sy = ref[1];
    ctx = this.plot_view.canvas_view.ctx;
    if (this.model.text === "" || this.model.text === null) {
      return;
    }
    if (this.model.render_mode === 'canvas') {
      return this._canvas_text(ctx, this.model.text, sx, sy, angle);
    } else {
      return this._css_text(ctx, this.model.text, sx, sy, angle);
    }
  };

  TitleView.prototype._get_size = function() {
    var ctx, text;
    text = this.model.text;
    if (text === "" || text === null) {
      return 0;
    } else {
      ctx = this.plot_view.canvas_view.ctx;
      this.visuals.text.set_value(ctx);
      return ctx.measureText(text).ascent + 10;
    }
  };

  return TitleView;

})(TextAnnotation.View);

Title = (function(superClass) {
  extend(Title, superClass);

  function Title() {
    return Title.__super__.constructor.apply(this, arguments);
  }

  Title.prototype.default_view = TitleView;

  Title.prototype.type = 'Title';

  Title.mixins(['line:border_', 'fill:background_']);

  Title.define({
    text: [p.String],
    text_font: [p.Font, 'helvetica'],
    text_font_size: [p.FontSizeSpec, '10pt'],
    text_font_style: [p.FontStyle, 'bold'],
    text_color: [p.ColorSpec, '#444444'],
    text_alpha: [p.NumberSpec, 1.0],
    align: [p.TextAlign, 'left'],
    offset: [p.Number, 0],
    render_mode: [p.RenderMode, 'canvas']
  });

  Title.override({
    background_fill_color: null,
    border_line_color: null
  });

  Title.internal({
    text_align: [p.TextAlign, 'left'],
    text_baseline: [p.TextBaseline, 'bottom']
  });

  return Title;

})(TextAnnotation.Model);

module.exports = {
  Model: Title,
  View: TitleView
};
