var Annotation, GlyphRenderer, Legend, LegendView, _, get_text_height, p,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

Annotation = require("./annotation");

GlyphRenderer = require("../renderers/glyph_renderer");

p = require("../../core/properties");

get_text_height = require("../../core/util/text").get_text_height;

LegendView = (function(superClass) {
  extend(LegendView, superClass);

  function LegendView() {
    return LegendView.__super__.constructor.apply(this, arguments);
  }

  LegendView.prototype.initialize = function(options) {
    return LegendView.__super__.initialize.call(this, options);
  };

  LegendView.prototype.compute_legend_bbox = function() {
    var ctx, glyph_height, glyph_width, h_range, i, label_height, label_standoff, label_width, legend_height, legend_margin, legend_names, legend_padding, legend_spacing, legend_width, len, location, max_label_width, name, ref, v_range, width, x, y;
    legend_names = this.model.get_legend_names();
    glyph_height = this.model.glyph_height;
    glyph_width = this.model.glyph_width;
    label_height = this.model.label_height;
    label_width = this.model.label_width;
    this.max_label_height = _.max([get_text_height(this.visuals.label_text.font_value()).height, label_height, glyph_height]);
    ctx = this.plot_view.canvas_view.ctx;
    ctx.save();
    this.visuals.label_text.set_value(ctx);
    this.text_widths = {};
    for (i = 0, len = legend_names.length; i < len; i++) {
      name = legend_names[i];
      this.text_widths[name] = _.max([ctx.measureText(name).width, label_width]);
    }
    ctx.restore();
    max_label_width = _.max(_.values(this.text_widths));
    legend_margin = this.model.margin;
    legend_padding = this.model.padding;
    legend_spacing = this.model.spacing;
    label_standoff = this.model.label_standoff;
    if (this.model.orientation === "vertical") {
      legend_height = legend_names.length * this.max_label_height + (legend_names.length - 1) * legend_spacing + 2 * legend_padding;
      legend_width = max_label_width + glyph_width + label_standoff + 2 * legend_padding;
    } else {
      legend_width = 2 * legend_padding + (legend_names.length - 1) * legend_spacing;
      ref = this.text_widths;
      for (name in ref) {
        width = ref[name];
        legend_width += _.max([width, label_width]) + glyph_width + label_standoff;
      }
      legend_height = this.max_label_height + 2 * legend_padding;
    }
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
    x = this.plot_view.canvas.vx_to_sx(x);
    y = this.plot_view.canvas.vy_to_sy(y);
    return {
      x: x,
      y: y,
      width: legend_width,
      height: legend_height
    };
  };

  LegendView.prototype.render = function() {
    var bbox, ctx;
    if (this.model.items.length === 0) {
      return;
    }
    ctx = this.plot_view.canvas_view.ctx;
    bbox = this.compute_legend_bbox();
    ctx.save();
    this._draw_legend_box(ctx, bbox);
    this._draw_legend_items(ctx, bbox);
    return ctx.restore();
  };

  LegendView.prototype._draw_legend_box = function(ctx, bbox) {
    var panel_offset;
    if (this.model.panel != null) {
      panel_offset = this._get_panel_offset();
      ctx.translate(panel_offset.x, panel_offset.y);
    }
    ctx.beginPath();
    ctx.rect(bbox.x, bbox.y, bbox.width, bbox.height);
    this.visuals.background_fill.set_value(ctx);
    ctx.fill();
    if (this.visuals.border_line.doit) {
      this.visuals.border_line.set_value(ctx);
      return ctx.stroke();
    }
  };

  LegendView.prototype._draw_legend_items = function(ctx, bbox) {
    var field, glyph_height, glyph_width, i, item, label, label_standoff, labels, legend_spacing, len, r, ref, results, view, x1, x2, xoffset, y1, y2, yoffset;
    glyph_height = this.model.glyph_height;
    glyph_width = this.model.glyph_width;
    legend_spacing = this.model.spacing;
    label_standoff = this.model.label_standoff;
    xoffset = yoffset = this.model.padding;
    ref = this.model.items;
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      item = ref[i];
      labels = item.get_labels_list_from_label_prop();
      field = item.get_field_from_label_prop();
      if (labels.length === 0) {
        continue;
      }
      results.push((function() {
        var j, len1, results1;
        results1 = [];
        for (j = 0, len1 = labels.length; j < len1; j++) {
          label = labels[j];
          x1 = bbox.x + xoffset;
          y1 = bbox.y + yoffset;
          x2 = x1 + glyph_width;
          y2 = y1 + glyph_height;
          if (this.model.orientation === "vertical") {
            yoffset += this.max_label_height + legend_spacing;
          } else {
            xoffset += this.text_widths[label] + glyph_width + label_standoff + legend_spacing;
          }
          this.visuals.label_text.set_value(ctx);
          ctx.fillText(label, x2 + label_standoff, y1 + this.max_label_height / 2.0);
          results1.push((function() {
            var k, len2, ref1, results2;
            ref1 = item.renderers;
            results2 = [];
            for (k = 0, len2 = ref1.length; k < len2; k++) {
              r = ref1[k];
              view = this.plot_view.renderer_views[r.id];
              results2.push(view.draw_legend(ctx, x1, x2, y1, y2, field, label));
            }
            return results2;
          }).call(this));
        }
        return results1;
      }).call(this));
    }
    return results;
  };

  LegendView.prototype._get_size = function() {
    var bbox, side;
    bbox = this.compute_legend_bbox();
    side = this.model.panel.side;
    if (side === 'above' || side === 'below') {
      return bbox.height;
    }
    if (side === 'left' || side === 'right') {
      return bbox.width;
    }
  };

  LegendView.prototype._get_panel_offset = function() {
    var x, y;
    x = this.model.panel._left._value;
    y = this.model.panel._top._value;
    return {
      x: x,
      y: -y
    };
  };

  return LegendView;

})(Annotation.View);

Legend = (function(superClass) {
  extend(Legend, superClass);

  function Legend() {
    return Legend.__super__.constructor.apply(this, arguments);
  }

  Legend.prototype.default_view = LegendView;

  Legend.prototype.type = 'Legend';

  Legend.prototype.get_legend_names = function() {
    var i, item, labels, legend_names, len, ref;
    legend_names = [];
    ref = this.items;
    for (i = 0, len = ref.length; i < len; i++) {
      item = ref[i];
      labels = item.get_labels_list_from_label_prop();
      legend_names = legend_names.concat(labels);
    }
    return legend_names;
  };

  Legend.mixins(['text:label_', 'line:border_', 'fill:background_']);

  Legend.define({
    orientation: [p.Orientation, 'vertical'],
    location: [p.Any, 'top_right'],
    label_standoff: [p.Number, 5],
    glyph_height: [p.Number, 20],
    glyph_width: [p.Number, 20],
    label_height: [p.Number, 20],
    label_width: [p.Number, 20],
    margin: [p.Number, 10],
    padding: [p.Number, 10],
    spacing: [p.Number, 3],
    items: [p.Array, []]
  });

  Legend.override({
    border_line_color: "#e5e5e5",
    border_line_alpha: 0.5,
    border_line_width: 1,
    background_fill_color: "#ffffff",
    background_fill_alpha: 0.95,
    label_text_font_size: "10pt",
    label_text_baseline: "middle"
  });

  return Legend;

})(Annotation.Model);

module.exports = {
  Model: Legend,
  View: LegendView
};
