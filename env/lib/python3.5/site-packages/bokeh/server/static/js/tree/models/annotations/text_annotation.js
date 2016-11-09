var Annotation, TextAnnotation, TextAnnotationView, _, get_text_height, p,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

Annotation = require("./annotation");

p = require("../../core/properties");

get_text_height = require("../../core/util/text").get_text_height;

TextAnnotationView = (function(superClass) {
  extend(TextAnnotationView, superClass);

  function TextAnnotationView() {
    return TextAnnotationView.__super__.constructor.apply(this, arguments);
  }

  TextAnnotationView.prototype.initialize = function(options) {
    TextAnnotationView.__super__.initialize.call(this, options);
    this.canvas = this.plot_model.canvas;
    this.frame = this.plot_model.frame;
    if (this.model.render_mode === 'css') {
      this.$el.addClass('bk-annotation');
      return this.$el.appendTo(this.plot_view.$el.find('div.bk-canvas-overlays'));
    }
  };

  TextAnnotationView.prototype.bind_bokeh_events = function() {
    if (this.model.render_mode === 'css') {
      return this.listenTo(this.model, 'change', this.render);
    } else {
      return this.listenTo(this.model, 'change', this.plot_view.request_render);
    }
  };

  TextAnnotationView.prototype._calculate_text_dimensions = function(ctx, text) {
    var height, width;
    width = ctx.measureText(text).width;
    height = get_text_height(this.visuals.text.font_value()).height;
    return [width, height];
  };

  TextAnnotationView.prototype._calculate_bounding_box_dimensions = function(ctx, text) {
    var height, ref, width, x_offset, y_offset;
    ref = this._calculate_text_dimensions(ctx, text), width = ref[0], height = ref[1];
    switch (ctx.textAlign) {
      case 'left':
        x_offset = 0;
        break;
      case 'center':
        x_offset = -width / 2;
        break;
      case 'right':
        x_offset = -width;
    }
    switch (ctx.textBaseline) {
      case 'top':
        y_offset = 0.0;
        break;
      case 'middle':
        y_offset = -0.5 * height;
        break;
      case 'bottom':
        y_offset = -1.0 * height;
        break;
      case 'alphabetic':
        y_offset = -0.8 * height;
        break;
      case 'hanging':
        y_offset = -0.17 * height;
        break;
      case 'ideographic':
        y_offset = -0.83 * height;
    }
    return [x_offset, y_offset, width, height];
  };

  TextAnnotationView.prototype._get_size = function() {
    var ctx;
    ctx = this.plot_view.canvas_view.ctx;
    this.visuals.text.set_value(ctx);
    return ctx.measureText(this.model.text).ascent;
  };

  TextAnnotationView.prototype.render = function() {
    return null;
  };

  TextAnnotationView.prototype._canvas_text = function(ctx, text, sx, sy, angle) {
    var bbox_dims;
    this.visuals.text.set_value(ctx);
    bbox_dims = this._calculate_bounding_box_dimensions(ctx, text);
    ctx.save();
    ctx.beginPath();
    ctx.translate(sx, sy);
    if (angle) {
      ctx.rotate(angle);
    }
    ctx.rect(bbox_dims[0], bbox_dims[1], bbox_dims[2], bbox_dims[3]);
    if (this.visuals.background_fill.doit) {
      this.visuals.background_fill.set_value(ctx);
      ctx.fill();
    }
    if (this.visuals.border_line.doit) {
      this.visuals.border_line.set_value(ctx);
      ctx.stroke();
    }
    if (this.visuals.text.doit) {
      this.visuals.text.set_value(ctx);
      ctx.fillText(text, 0, 0);
    }
    return ctx.restore();
  };

  TextAnnotationView.prototype._css_text = function(ctx, text, sx, sy, angle) {
    var bbox_dims, div_style, ld, line_dash;
    this.$el.hide();
    this.visuals.text.set_value(ctx);
    bbox_dims = this._calculate_bounding_box_dimensions(ctx, text);
    ld = this.visuals.border_line.line_dash.value();
    if (_.isArray(ld)) {
      if (ld.length < 2) {
        line_dash = "solid";
      } else {
        line_dash = "dashed";
      }
    }
    if (_.isString(ld)) {
      line_dash = ld;
    }
    this.visuals.border_line.set_value(ctx);
    this.visuals.background_fill.set_value(ctx);
    div_style = {
      'position': 'absolute',
      'left': (sx + bbox_dims[0]) + "px",
      'top': (sy + bbox_dims[1]) + "px",
      'color': "" + (this.visuals.text.text_color.value()),
      'opacity': "" + (this.visuals.text.text_alpha.value()),
      'font': "" + (this.visuals.text.font_value()),
      'line-height': "normal"
    };
    if (angle) {
      _.extend(div_style, {
        'transform': "rotate(" + angle + "rad)"
      });
    }
    if (this.visuals.background_fill.doit) {
      _.extend(div_style, {
        'background-color': "" + (this.visuals.background_fill.color_value())
      });
    }
    if (this.visuals.border_line.doit) {
      _.extend(div_style, {
        'border-style': "" + line_dash,
        'border-width': "" + (this.visuals.border_line.line_width.value()),
        'border-color': "" + (this.visuals.border_line.color_value())
      });
    }
    return this.$el.html(text).css(div_style).show();
  };

  return TextAnnotationView;

})(Annotation.View);

TextAnnotation = (function(superClass) {
  extend(TextAnnotation, superClass);

  function TextAnnotation() {
    return TextAnnotation.__super__.constructor.apply(this, arguments);
  }

  TextAnnotation.prototype.type = 'TextAnnotation';

  TextAnnotation.prototype.default_view = TextAnnotationView;

  return TextAnnotation;

})(Annotation.Model);

module.exports = {
  Model: TextAnnotation,
  View: TextAnnotationView
};
