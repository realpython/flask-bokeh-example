var $, ColumnDataSource, LabelSet, LabelSetView, TextAnnotation, _, p,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

$ = require("jquery");

TextAnnotation = require("./text_annotation");

ColumnDataSource = require("../sources/column_data_source");

p = require("../../core/properties");

LabelSetView = (function(superClass) {
  extend(LabelSetView, superClass);

  function LabelSetView() {
    return LabelSetView.__super__.constructor.apply(this, arguments);
  }

  LabelSetView.prototype.initialize = function(options) {
    var i, j, ref, results;
    LabelSetView.__super__.initialize.call(this, options);
    this.xmapper = this.plot_view.frame.x_mappers[this.model.x_range_name];
    this.ymapper = this.plot_view.frame.y_mappers[this.model.y_range_name];
    this.set_data(this.model.source);
    if (this.model.render_mode === 'css') {
      results = [];
      for (i = j = 0, ref = this._text.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
        this.title_div = $("<div>").addClass('bk-annotation-child').hide();
        results.push(this.title_div.appendTo(this.$el));
      }
      return results;
    }
  };

  LabelSetView.prototype.bind_bokeh_events = function() {
    if (this.model.render_mode === 'css') {
      this.listenTo(this.model, 'change', function() {
        this.set_data(this.model.source);
        return this.render();
      });
      return this.listenTo(this.model.source, 'change', function() {
        this.set_data(this.model.source);
        return this.render();
      });
    } else {
      this.listenTo(this.model, 'change', function() {
        this.set_data(this.model.source);
        return this.plot_view.request_render();
      });
      return this.listenTo(this.model.source, 'change', function() {
        this.set_data(this.model.source);
        return this.plot_view.request_render();
      });
    }
  };

  LabelSetView.prototype.set_data = function(source) {
    LabelSetView.__super__.set_data.call(this, source);
    return this.visuals.warm_cache(source);
  };

  LabelSetView.prototype._map_data = function() {
    var sx, sy, vx, vy;
    if (this.model.x_units === "data") {
      vx = this.xmapper.v_map_to_target(this._x);
    } else {
      vx = this._x.slice(0);
    }
    sx = this.canvas.v_vx_to_sx(vx);
    if (this.model.y_units === "data") {
      vy = this.ymapper.v_map_to_target(this._y);
    } else {
      vy = this._y.slice(0);
    }
    sy = this.canvas.v_vy_to_sy(vy);
    return [sx, sy];
  };

  LabelSetView.prototype.render = function() {
    var ctx, i, j, k, ref, ref1, ref2, results, results1, sx, sy;
    ctx = this.plot_view.canvas_view.ctx;
    ref = this._map_data(), sx = ref[0], sy = ref[1];
    if (this.model.render_mode === 'canvas') {
      results = [];
      for (i = j = 0, ref1 = this._text.length; 0 <= ref1 ? j < ref1 : j > ref1; i = 0 <= ref1 ? ++j : --j) {
        results.push(this._v_canvas_text(ctx, i, this._text[i], sx[i] + this._x_offset[i], sy[i] - this._y_offset[i], this._angle[i]));
      }
      return results;
    } else {
      results1 = [];
      for (i = k = 0, ref2 = this._text.length; 0 <= ref2 ? k < ref2 : k > ref2; i = 0 <= ref2 ? ++k : --k) {
        results1.push(this._v_css_text(ctx, i, this._text[i], sx[i] + this._x_offset[i], sy[i] - this._y_offset[i], this._angle[i]));
      }
      return results1;
    }
  };

  LabelSetView.prototype._get_size = function() {
    var ctx, height, side, width;
    ctx = this.plot_view.canvas_view.ctx;
    this.visuals.text.set_value(ctx);
    side = this.model.panel.side;
    if (side === "above" || side === "below") {
      height = ctx.measureText(this._text[0]).ascent;
      return height;
    }
    if (side === 'left' || side === 'right') {
      width = ctx.measureText(this._text[0]).width;
      return width;
    }
  };

  LabelSetView.prototype._v_canvas_text = function(ctx, i, text, sx, sy, angle) {
    var bbox_dims;
    this.visuals.text.set_vectorize(ctx, i);
    bbox_dims = this._calculate_bounding_box_dimensions(ctx, text);
    ctx.save();
    ctx.beginPath();
    ctx.translate(sx, sy);
    ctx.rotate(angle);
    ctx.rect(bbox_dims[0], bbox_dims[1], bbox_dims[2], bbox_dims[3]);
    if (this.visuals.background_fill.doit) {
      this.visuals.background_fill.set_vectorize(ctx, i);
      ctx.fill();
    }
    if (this.visuals.border_line.doit) {
      this.visuals.border_line.set_vectorize(ctx, i);
      ctx.stroke();
    }
    if (this.visuals.text.doit) {
      this.visuals.text.set_vectorize(ctx, i);
      ctx.fillText(text, 0, 0);
    }
    return ctx.restore();
  };

  LabelSetView.prototype._v_css_text = function(ctx, i, text, sx, sy, angle) {
    var bbox_dims, div_style, ld, line_dash;
    this.visuals.text.set_vectorize(ctx, i);
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
    this.visuals.border_line.set_vectorize(ctx, i);
    this.visuals.background_fill.set_vectorize(ctx, i);
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
    return this.$el.children().eq(i).html(text).css(div_style).show();
  };

  return LabelSetView;

})(TextAnnotation.View);

LabelSet = (function(superClass) {
  extend(LabelSet, superClass);

  function LabelSet() {
    return LabelSet.__super__.constructor.apply(this, arguments);
  }

  LabelSet.prototype.default_view = LabelSetView;

  LabelSet.prototype.type = 'Label';

  LabelSet.mixins(['text', 'line:border_', 'fill:background_']);

  LabelSet.define({
    x: [p.NumberSpec],
    y: [p.NumberSpec],
    x_units: [p.SpatialUnits, 'data'],
    y_units: [p.SpatialUnits, 'data'],
    text: [
      p.StringSpec, {
        field: "text"
      }
    ],
    angle: [p.AngleSpec, 0],
    x_offset: [
      p.NumberSpec, {
        value: 0
      }
    ],
    y_offset: [
      p.NumberSpec, {
        value: 0
      }
    ],
    source: [
      p.Instance, function() {
        return new ColumnDataSource.Model();
      }
    ],
    x_range_name: [p.String, 'default'],
    y_range_name: [p.String, 'default'],
    render_mode: [p.RenderMode, 'canvas']
  });

  LabelSet.override({
    background_fill_color: null,
    border_line_color: null
  });

  return LabelSet;

})(TextAnnotation.Model);

module.exports = {
  Model: LabelSet,
  View: LabelSetView
};
