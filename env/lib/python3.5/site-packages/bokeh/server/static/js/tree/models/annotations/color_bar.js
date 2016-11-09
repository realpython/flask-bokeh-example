var Annotation, BasicTickFormatter, BasicTicker, ColorBar, ColorBarView, LONG_DIM_MAX_SCALAR, LONG_DIM_MIN_SCALAR, LinearColorMapper, LinearMapper, LogMapper, Range1d, SHORT_DIM, _, p, text_util,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

Annotation = require("./annotation");

BasicTicker = require("../tickers/basic_ticker");

BasicTickFormatter = require("../formatters/basic_tick_formatter");

LinearColorMapper = require("../mappers/linear_color_mapper");

LinearMapper = require("../mappers/linear_mapper");

LogMapper = require("../mappers/log_mapper");

Range1d = require("../ranges/range1d");

p = require("../../core/properties");

text_util = require("../../core/util/text");

SHORT_DIM = 25;

LONG_DIM_MIN_SCALAR = 0.3;

LONG_DIM_MAX_SCALAR = 0.8;

ColorBarView = (function(superClass) {
  extend(ColorBarView, superClass);

  function ColorBarView() {
    return ColorBarView.__super__.constructor.apply(this, arguments);
  }

  ColorBarView.prototype.initialize = function(options) {
    ColorBarView.__super__.initialize.call(this, options);
    return this._set_canvas_image();
  };

  ColorBarView.prototype.bind_bokeh_events = function() {
    this.listenTo(this.model, 'change:visible', this.plot_view.request_render);
    this.listenTo(this.model.ticker, 'change', this.plot_view.request_render);
    this.listenTo(this.model.formatter, 'change', this.plot_view.request_render);
    return this.listenTo(this.model.color_mapper, 'change', function() {
      this._set_canvas_image();
      return this.plot_view.request_render();
    });
  };

  ColorBarView.prototype._get_panel_offset = function() {
    var x, y;
    x = this.model.panel._left._value;
    y = this.model.panel._top._value;
    return {
      x: x,
      y: -y
    };
  };

  ColorBarView.prototype._get_size = function() {
    var bbox, side;
    bbox = this.compute_legend_dimensions();
    side = this.model.panel.side;
    if (side === 'above' || side === 'below') {
      return bbox.height;
    }
    if (side === 'left' || side === 'right') {
      return bbox.width;
    }
  };

  ColorBarView.prototype._set_canvas_image = function() {
    var buf, buf8, canvas, cmap, h, image_ctx, image_data, k, palette, ref, ref1, ref2, ref3, results, w;
    palette = this.model.color_mapper.palette;
    if (this.model.orientation === 'vertical') {
      palette = palette.slice(0).reverse();
    }
    switch (this.model.orientation) {
      case "vertical":
        ref = [1, palette.length], w = ref[0], h = ref[1];
        break;
      case "horizontal":
        ref1 = [palette.length, 1], w = ref1[0], h = ref1[1];
    }
    canvas = document.createElement('canvas');
    ref2 = [w, h], canvas.width = ref2[0], canvas.height = ref2[1];
    image_ctx = canvas.getContext('2d');
    image_data = image_ctx.getImageData(0, 0, w, h);
    cmap = new LinearColorMapper.Model({
      palette: palette
    });
    buf = cmap.v_map_screen((function() {
      results = [];
      for (var k = 0, ref3 = palette.length; 0 <= ref3 ? k < ref3 : k > ref3; 0 <= ref3 ? k++ : k--){ results.push(k); }
      return results;
    }).apply(this));
    buf8 = new Uint8ClampedArray(buf);
    image_data.data.set(buf8);
    image_ctx.putImageData(image_data, 0, 0);
    return this.image = canvas;
  };

  ColorBarView.prototype.compute_legend_dimensions = function() {
    var image_dimensions, image_height, image_width, label_extent, legend_height, legend_width, padding, ref, tick_extent, title_extent;
    image_dimensions = this.model._computed_image_dimensions();
    ref = [image_dimensions.height, image_dimensions.width], image_height = ref[0], image_width = ref[1];
    label_extent = this._get_label_extent();
    title_extent = this.model._title_extent();
    tick_extent = this.model._tick_extent();
    padding = this.model.padding;
    switch (this.model.orientation) {
      case "vertical":
        legend_height = image_height + title_extent + padding * 2;
        legend_width = image_width + tick_extent + label_extent + padding * 2;
        break;
      case "horizontal":
        legend_height = image_height + title_extent + tick_extent + label_extent + padding * 2;
        legend_width = image_width + padding * 2;
    }
    return {
      height: legend_height,
      width: legend_width
    };
  };

  ColorBarView.prototype.compute_legend_location = function() {
    var h_range, legend_dimensions, legend_height, legend_margin, legend_width, location, ref, sx, sy, v_range, x, y;
    legend_dimensions = this.compute_legend_dimensions();
    ref = [legend_dimensions.height, legend_dimensions.width], legend_height = ref[0], legend_width = ref[1];
    legend_margin = this.model.margin;
    location = this.model.location;
    h_range = this.plot_view.frame.h_range;
    v_range = this.plot_view.frame.v_range;
    if (_.isString(location)) {
      switch (location) {
        case 'top_left':
          x = h_range.start + legend_margin;
          y = v_range.end - legend_margin;
          break;
        case 'top_center':
          x = (h_range.end + h_range.start) / 2 - legend_width / 2;
          y = v_range.end - legend_margin;
          break;
        case 'top_right':
          x = h_range.end - legend_margin - legend_width;
          y = v_range.end - legend_margin;
          break;
        case 'right_center':
          x = h_range.end - legend_margin - legend_width;
          y = (v_range.end + v_range.start) / 2 + legend_height / 2;
          break;
        case 'bottom_right':
          x = h_range.end - legend_margin - legend_width;
          y = v_range.start + legend_margin + legend_height;
          break;
        case 'bottom_center':
          x = (h_range.end + h_range.start) / 2 - legend_width / 2;
          y = v_range.start + legend_margin + legend_height;
          break;
        case 'bottom_left':
          x = h_range.start + legend_margin;
          y = v_range.start + legend_margin + legend_height;
          break;
        case 'left_center':
          x = h_range.start + legend_margin;
          y = (v_range.end + v_range.start) / 2 + legend_height / 2;
          break;
        case 'center':
          x = (h_range.end + h_range.start) / 2 - legend_width / 2;
          y = (v_range.end + v_range.start) / 2 + legend_height / 2;
      }
    } else if (_.isArray(location) && location.length === 2) {
      x = location[0], y = location[1];
    }
    sx = this.plot_view.canvas.vx_to_sx(x);
    sy = this.plot_view.canvas.vy_to_sy(y);
    return {
      sx: sx,
      sy: sy
    };
  };

  ColorBarView.prototype.render = function() {
    var ctx, frame_offset, image_offset, location, panel_offset;
    if (this.model.visible === false) {
      return;
    }
    ctx = this.plot_view.canvas_view.ctx;
    ctx.save();
    if (this.model.panel != null) {
      panel_offset = this._get_panel_offset();
      ctx.translate(panel_offset.x, panel_offset.y);
      frame_offset = this._get_frame_offset();
      ctx.translate(frame_offset.x, frame_offset.y);
    }
    location = this.compute_legend_location();
    ctx.translate(location.sx, location.sy);
    this._draw_bbox(ctx);
    image_offset = this._get_image_offset();
    ctx.translate(image_offset.x, image_offset.y);
    this._draw_image(ctx);
    if ((this.model.color_mapper.low != null) && (this.model.color_mapper.high != null)) {
      this._draw_major_ticks(ctx);
      this._draw_minor_ticks(ctx);
      this._draw_major_labels(ctx);
    }
    if (this.model.title) {
      this._draw_title(ctx);
    }
    return ctx.restore();
  };

  ColorBarView.prototype._draw_bbox = function(ctx) {
    var bbox;
    bbox = this.compute_legend_dimensions();
    ctx.save();
    if (this.visuals.background_fill.doit) {
      this.visuals.background_fill.set_value(ctx);
      ctx.fillRect(0, 0, bbox.width, bbox.height);
    }
    if (this.visuals.border_line.doit) {
      this.visuals.border_line.set_value(ctx);
      ctx.strokeRect(0, 0, bbox.width, bbox.height);
    }
    return ctx.restore();
  };

  ColorBarView.prototype._draw_image = function(ctx) {
    var image;
    image = this.model._computed_image_dimensions();
    ctx.save();
    ctx.setImageSmoothingEnabled(false);
    ctx.globalAlpha = this.model.scale_alpha;
    ctx.drawImage(this.image, 0, 0, image.width, image.height);
    if (this.visuals.bar_line.doit) {
      this.visuals.bar_line.set_value(ctx);
      ctx.strokeRect(0, 0, image.width, image.height);
    }
    return ctx.restore();
  };

  ColorBarView.prototype._draw_major_ticks = function(ctx) {
    var i, image, k, nx, ny, ref, ref1, ref2, ref3, sx, sy, tin, tout, x_offset, y_offset;
    if (!this.visuals.major_tick_line.doit) {
      return;
    }
    ref = this.model._normals(), nx = ref[0], ny = ref[1];
    image = this.model._computed_image_dimensions();
    ref1 = [image.width * nx, image.height * ny], x_offset = ref1[0], y_offset = ref1[1];
    ref2 = this.model._tick_coordinates().major, sx = ref2[0], sy = ref2[1];
    tin = this.model.major_tick_in;
    tout = this.model.major_tick_out;
    ctx.save();
    ctx.translate(x_offset, y_offset);
    this.visuals.major_tick_line.set_value(ctx);
    for (i = k = 0, ref3 = sx.length; 0 <= ref3 ? k < ref3 : k > ref3; i = 0 <= ref3 ? ++k : --k) {
      ctx.beginPath();
      ctx.moveTo(Math.round(sx[i] + nx * tout), Math.round(sy[i] + ny * tout));
      ctx.lineTo(Math.round(sx[i] - nx * tin), Math.round(sy[i] - ny * tin));
      ctx.stroke();
    }
    return ctx.restore();
  };

  ColorBarView.prototype._draw_minor_ticks = function(ctx) {
    var i, image, k, nx, ny, ref, ref1, ref2, ref3, sx, sy, tin, tout, x_offset, y_offset;
    if (!this.visuals.minor_tick_line.doit) {
      return;
    }
    ref = this.model._normals(), nx = ref[0], ny = ref[1];
    image = this.model._computed_image_dimensions();
    ref1 = [image.width * nx, image.height * ny], x_offset = ref1[0], y_offset = ref1[1];
    ref2 = this.model._tick_coordinates().minor, sx = ref2[0], sy = ref2[1];
    tin = this.model.minor_tick_in;
    tout = this.model.minor_tick_out;
    ctx.save();
    ctx.translate(x_offset, y_offset);
    this.visuals.minor_tick_line.set_value(ctx);
    for (i = k = 0, ref3 = sx.length; 0 <= ref3 ? k < ref3 : k > ref3; i = 0 <= ref3 ? ++k : --k) {
      ctx.beginPath();
      ctx.moveTo(Math.round(sx[i] + nx * tout), Math.round(sy[i] + ny * tout));
      ctx.lineTo(Math.round(sx[i] - nx * tin), Math.round(sy[i] - ny * tin));
      ctx.stroke();
    }
    return ctx.restore();
  };

  ColorBarView.prototype._draw_major_labels = function(ctx) {
    var formatted_labels, i, image, k, labels, nx, ny, ref, ref1, ref2, ref3, ref4, standoff, sx, sy, x_offset, x_standoff, y_offset, y_standoff;
    if (!this.visuals.major_label_text.doit) {
      return;
    }
    ref = this.model._normals(), nx = ref[0], ny = ref[1];
    image = this.model._computed_image_dimensions();
    ref1 = [image.width * nx, image.height * ny], x_offset = ref1[0], y_offset = ref1[1];
    standoff = this.model.label_standoff + this.model._tick_extent();
    ref2 = [standoff * nx, standoff * ny], x_standoff = ref2[0], y_standoff = ref2[1];
    ref3 = this.model._tick_coordinates().major, sx = ref3[0], sy = ref3[1];
    labels = this.model._tick_coordinates().major_labels;
    formatted_labels = this.model.formatter.doFormat(labels);
    this.visuals.major_label_text.set_value(ctx);
    ctx.save();
    ctx.translate(x_offset + x_standoff, y_offset + y_standoff);
    for (i = k = 0, ref4 = sx.length; 0 <= ref4 ? k < ref4 : k > ref4; i = 0 <= ref4 ? ++k : --k) {
      ctx.fillText(formatted_labels[i], Math.round(sx[i] + nx * this.model.label_standoff), Math.round(sy[i] + ny * this.model.label_standoff));
    }
    return ctx.restore();
  };

  ColorBarView.prototype._draw_title = function(ctx) {
    if (!this.visuals.title_text.doit) {
      return;
    }
    ctx.save();
    this.visuals.title_text.set_value(ctx);
    ctx.fillText(this.model.title, 0, -this.model.title_standoff);
    return ctx.restore();
  };

  ColorBarView.prototype._get_label_extent = function() {
    var ctx, formatted_labels, label, label_extent;
    if ((this.model.color_mapper.low != null) && (this.model.color_mapper.high != null)) {
      ctx = this.plot_view.canvas_view.ctx;
      ctx.save();
      this.visuals.major_label_text.set_value(ctx);
      switch (this.model.orientation) {
        case "vertical":
          formatted_labels = this.model.formatter.doFormat(this.model._tick_coordinates().major_labels);
          label_extent = _.max((function() {
            var k, len, results;
            results = [];
            for (k = 0, len = formatted_labels.length; k < len; k++) {
              label = formatted_labels[k];
              results.push(ctx.measureText(label.toString()).width);
            }
            return results;
          })());
          break;
        case "horizontal":
          label_extent = text_util.get_text_height(this.visuals.major_label_text.font_value()).height;
      }
      label_extent += this.model.label_standoff;
      ctx.restore();
    } else {
      label_extent = 0;
    }
    return label_extent;
  };

  ColorBarView.prototype._get_frame_offset = function() {
    var frame, panel, ref, xoff, yoff;
    ref = [0, 0], xoff = ref[0], yoff = ref[1];
    panel = this.model.panel;
    frame = this.plot_view.frame;
    switch (panel.side) {
      case "left":
      case "right":
        yoff = Math.abs(panel.top - frame.top);
        break;
      case "above":
      case "below":
        xoff = Math.abs(frame.left);
    }
    return {
      x: xoff,
      y: yoff
    };
  };

  ColorBarView.prototype._get_image_offset = function() {
    var x, y;
    x = this.model.padding;
    y = this.model.padding + this.model._title_extent();
    return {
      x: x,
      y: y
    };
  };

  return ColorBarView;

})(Annotation.View);

ColorBar = (function(superClass) {
  extend(ColorBar, superClass);

  function ColorBar() {
    return ColorBar.__super__.constructor.apply(this, arguments);
  }

  ColorBar.prototype.default_view = ColorBarView;

  ColorBar.prototype.type = 'ColorBar';

  ColorBar.mixins(['text:major_label_', 'text:title_', 'line:major_tick_', 'line:minor_tick_', 'line:border_', 'line:bar_', 'fill:background_']);

  ColorBar.define({
    location: [p.Any, 'top_right'],
    orientation: [p.Orientation, 'vertical'],
    title: [p.String],
    title_standoff: [p.Number, 2],
    height: [p.Any, 'auto'],
    width: [p.Any, 'auto'],
    scale_alpha: [p.Number, 1.0],
    ticker: [
      p.Instance, function() {
        return new BasicTicker.Model();
      }
    ],
    formatter: [
      p.Instance, function() {
        return new BasicTickFormatter.Model();
      }
    ],
    color_mapper: [p.Instance],
    label_standoff: [p.Number, 5],
    margin: [p.Number, 30],
    padding: [p.Number, 10],
    major_tick_in: [p.Number, 5],
    major_tick_out: [p.Number, 0],
    minor_tick_in: [p.Number, 0],
    minor_tick_out: [p.Number, 0]
  });

  ColorBar.override({
    background_fill_color: "#ffffff",
    background_fill_alpha: 0.95,
    bar_line_color: null,
    border_line_color: null,
    major_label_text_align: "center",
    major_label_text_baseline: "middle",
    major_label_text_font_size: "8pt",
    major_tick_line_color: "#ffffff",
    minor_tick_line_color: null,
    title_text_font_size: "10pt",
    title_text_font_style: "italic"
  });

  ColorBar.prototype.initialize = function(attrs, options) {
    return ColorBar.__super__.initialize.call(this, attrs, options);
  };

  ColorBar.prototype._normals = function() {
    var i, j, ref, ref1;
    if (this.orientation === 'vertical') {
      ref = [1, 0], i = ref[0], j = ref[1];
    } else {
      ref1 = [0, 1], i = ref1[0], j = ref1[1];
    }
    return [i, j];
  };

  ColorBar.prototype._title_extent = function() {
    var font_value, title_extent;
    font_value = this.title_text_font + " " + this.title_text_font_size + " " + this.title_text_font_style;
    title_extent = this.title ? text_util.get_text_height(font_value).height + this.title_standoff : 0;
    return title_extent;
  };

  ColorBar.prototype._tick_extent = function() {
    var tick_extent;
    if ((this.color_mapper.low != null) && (this.color_mapper.high != null)) {
      tick_extent = _.max([this.major_tick_out, this.minor_tick_out]);
    } else {
      tick_extent = 0;
    }
    return tick_extent;
  };

  ColorBar.prototype._computed_image_dimensions = function() {

    /*
    Heuristics to determine ColorBar image dimensions if set to "auto"
    
    Note: Returns the height/width values for the ColorBar's scale image, not
    the dimensions of the entire ColorBar.
    
    If the short dimension (the width of a vertical bar or height of a
    horizontal bar) is set to "auto", the resulting dimension will be set to
    25 px.
    
    For a ColorBar in a side panel with the long dimension (the height of a
    vertical bar or width of a horizontal bar) set to "auto", the
    resulting dimension will be as long as the adjacent frame edge, so that the
    bar "fits" to the plot.
    
    For a ColorBar in the plot frame with the long dimension set to "auto", the
    resulting dimension will be the greater of:
      * The length of the color palette * 25px
      * The parallel frame dimension * 0.30
        (i.e the frame height for a vertical ColorBar)
    But not greater than:
      * The parallel frame dimension * 0.80
     */
    var frame_height, frame_width, height, title_extent, width;
    frame_height = this.plot.plot_canvas.frame.height;
    frame_width = this.plot.plot_canvas.frame.width;
    title_extent = this._title_extent();
    switch (this.orientation) {
      case "vertical":
        if (this.height === 'auto') {
          if (this.panel != null) {
            height = frame_height - 2 * this.padding - title_extent;
          } else {
            height = _.max([this.color_mapper.palette.length * SHORT_DIM, frame_height * LONG_DIM_MIN_SCALAR]);
            height = _.min([height, frame_height * LONG_DIM_MAX_SCALAR - 2 * this.padding - title_extent]);
          }
        } else {
          height = this.height;
        }
        width = this.width === 'auto' ? SHORT_DIM : this.width;
        break;
      case "horizontal":
        height = this.height === 'auto' ? SHORT_DIM : this.height;
        if (this.width === 'auto') {
          if (this.panel != null) {
            width = frame_width - 2 * this.padding;
          } else {
            width = _.max([this.color_mapper.palette.length * SHORT_DIM, frame_width * LONG_DIM_MIN_SCALAR]);
            width = _.min([width, frame_width * LONG_DIM_MAX_SCALAR - 2 * this.padding]);
          }
        } else {
          width = this.width;
        }
    }
    return {
      "height": height,
      "width": width
    };
  };

  ColorBar.prototype._tick_coordinate_mapper = function(scale_length) {

    /*
    Creates and returns a mapper instance that maps the `color_mapper` range
    (low to high) to a screen space range equal to the length of the ColorBar's
    scale image. The mapper is used to calculate the tick coordinates in screen
    coordinates for plotting purposes.
    
    Note: the type of color_mapper has to match the type of mapper (i.e.
    a LinearColorMapper will require a corresponding LinearMapper instance).
     */
    var mapper, mapping;
    mapping = {
      'source_range': new Range1d.Model({
        start: this.color_mapper.low,
        end: this.color_mapper.high
      }),
      'target_range': new Range1d.Model({
        start: 0,
        end: scale_length
      })
    };
    switch (this.color_mapper.type) {
      case "LinearColorMapper":
        mapper = new LinearMapper.Model(mapping);
        break;
      case "LogColorMapper":
        mapper = new LogMapper.Model(mapping);
    }
    return mapper;
  };

  ColorBar.prototype._tick_coordinates = function() {
    var coord, end, i, ii, image_dimensions, j, k, l, major_coords, major_labels, majors, mapper, minor_coords, minors, ref, ref1, ref2, ref3, scale_length, start, ticks;
    image_dimensions = this._computed_image_dimensions();
    switch (this.orientation) {
      case "vertical":
        scale_length = image_dimensions.height;
        break;
      case "horizontal":
        scale_length = image_dimensions.width;
    }
    mapper = this._tick_coordinate_mapper(scale_length);
    ref = this._normals(), i = ref[0], j = ref[1];
    ref1 = [this.color_mapper.low, this.color_mapper.high], start = ref1[0], end = ref1[1];
    ticks = this.ticker.get_ticks(start, end, null, this.ticker.desired_num_ticks);
    majors = ticks.major;
    minors = ticks.minor;
    major_coords = [[], []];
    minor_coords = [[], []];
    for (ii = k = 0, ref2 = majors.length; 0 <= ref2 ? k < ref2 : k > ref2; ii = 0 <= ref2 ? ++k : --k) {
      if (majors[ii] < start || majors[ii] > end) {
        continue;
      }
      major_coords[i].push(majors[ii]);
      major_coords[j].push(0);
    }
    for (ii = l = 0, ref3 = minors.length; 0 <= ref3 ? l < ref3 : l > ref3; ii = 0 <= ref3 ? ++l : --l) {
      if (minors[ii] < start || minors[ii] > end) {
        continue;
      }
      minor_coords[i].push(minors[ii]);
      minor_coords[j].push(0);
    }
    major_labels = major_coords[i].slice(0);
    major_coords[i] = mapper.v_map_to_target(major_coords[i]);
    minor_coords[i] = mapper.v_map_to_target(minor_coords[i]);
    if (this.orientation === 'vertical') {
      major_coords[i] = new Float64Array((function() {
        var len, m, ref4, results;
        ref4 = major_coords[i];
        results = [];
        for (m = 0, len = ref4.length; m < len; m++) {
          coord = ref4[m];
          results.push(scale_length - coord);
        }
        return results;
      })());
      minor_coords[i] = new Float64Array((function() {
        var len, m, ref4, results;
        ref4 = minor_coords[i];
        results = [];
        for (m = 0, len = ref4.length; m < len; m++) {
          coord = ref4[m];
          results.push(scale_length - coord);
        }
        return results;
      })());
    }
    return {
      "major": major_coords,
      "minor": minor_coords,
      "major_labels": major_labels
    };
  };

  return ColorBar;

})(Annotation.Model);

module.exports = {
  Model: ColorBar,
  View: ColorBarView
};
