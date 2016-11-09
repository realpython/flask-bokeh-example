var $, Document, _, bar, cumsum, embed, hexcolor2rgb, is_dark, models, num2hexcolor, palettes, pie, sprintf, sum;

_ = require("underscore");

$ = require("jquery");

sprintf = require("sprintf");

Document = require("../document").Document;

embed = require("../embed");

models = require("./models");

palettes = require("./palettes");

sum = function(array) {
  return array.reduce(((function(_this) {
    return function(a, b) {
      return a + b;
    };
  })(this)), 0);
};

cumsum = function(array) {
  var result;
  result = [];
  array.reduce((function(a, b, i) {
    return result[i] = a + b;
  }), 0);
  return result;
};

num2hexcolor = function(num) {
  return sprintf("#%06x", num);
};

hexcolor2rgb = function(color) {
  var b, g, r;
  r = parseInt(color.substr(1, 2), 16);
  g = parseInt(color.substr(3, 2), 16);
  b = parseInt(color.substr(5, 2), 16);
  return [r, g, b];
};

is_dark = function(arg) {
  var b, g, l, r;
  r = arg[0], g = arg[1], b = arg[2];
  l = 1 - (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return l >= 0.6;
};

pie = function(data, opts) {
  var angle_span, colors, cumulative_values, cx, cy, end_angle, end_angles, g1, g2, h1, half_angles, half_radius, hover, i, inner_radius, k, labels, normalized_values, outer_radius, palette, plot, r1, r2, ref, ref1, ref2, ref3, ref4, ref5, ref6, ref7, source, start_angle, start_angles, text_angles, text_colors, text_cx, text_cy, to_cartesian, to_radians, tooltip, total_value, values, xdr, ydr;
  if (opts == null) {
    opts = {};
  }
  labels = [];
  values = [];
  for (i = k = 0, ref = Math.min(data.labels.length, data.values.length); 0 <= ref ? k < ref : k > ref; i = 0 <= ref ? ++k : --k) {
    if (data.values[i] > 0) {
      labels.push(data.labels[i]);
      values.push(data.values[i]);
    }
  }
  start_angle = (ref1 = opts.start_angle) != null ? ref1 : 0;
  end_angle = (ref2 = opts.end_angle) != null ? ref2 : start_angle + 2 * Math.PI;
  angle_span = Math.abs(end_angle - start_angle);
  to_radians = function(x) {
    return angle_span * x;
  };
  total_value = sum(values);
  normalized_values = values.map(function(v) {
    return v / total_value;
  });
  cumulative_values = cumsum(normalized_values);
  end_angles = cumulative_values.map(function(v) {
    return start_angle + to_radians(v);
  });
  start_angles = [start_angle].concat(end_angles.slice(0, -1));
  half_angles = _.zip(start_angles, end_angles).map((function(_this) {
    return function(arg) {
      var end, start;
      start = arg[0], end = arg[1];
      return (start + end) / 2;
    };
  })(this));
  if (opts.center == null) {
    cx = 0;
    cy = 0;
  } else if (_.isArray(opts.center)) {
    cx = opts.center[0];
    cy = opts.center[1];
  } else {
    cx = opts.center.x;
    cy = opts.center.y;
  }
  inner_radius = (ref3 = opts.inner_radius) != null ? ref3 : 0;
  outer_radius = (ref4 = opts.outer_radius) != null ? ref4 : 1;
  if (_.isArray(opts.palette)) {
    palette = opts.palette;
  } else {
    palette = palettes[(ref5 = opts.palette) != null ? ref5 : "Spectral11"].map(num2hexcolor);
  }
  colors = (function() {
    var m, ref6, results;
    results = [];
    for (i = m = 0, ref6 = normalized_values.length; 0 <= ref6 ? m < ref6 : m > ref6; i = 0 <= ref6 ? ++m : --m) {
      results.push(palette[i % palette.length]);
    }
    return results;
  })();
  text_colors = colors.map(function(c) {
    if (is_dark(hexcolor2rgb(c))) {
      return "white";
    } else {
      return "black";
    }
  });
  to_cartesian = function(r, alpha) {
    return [r * Math.cos(alpha), r * Math.sin(alpha)];
  };
  half_radius = (inner_radius + outer_radius) / 2;
  ref6 = _.unzip(half_angles.map((function(_this) {
    return function(half_angle) {
      return to_cartesian(half_radius, half_angle);
    };
  })(this))), text_cx = ref6[0], text_cy = ref6[1];
  text_cx = text_cx.map(function(x) {
    return x + cx;
  });
  text_cy = text_cy.map(function(y) {
    return y + cy;
  });
  text_angles = half_angles.map(function(a) {
    if (a >= Math.PI / 2 && a <= 3 * Math.PI / 2) {
      return a + Math.PI;
    } else {
      return a;
    }
  });
  source = new Bokeh.ColumnDataSource({
    data: {
      labels: labels,
      values: values,
      percentages: normalized_values.map((function(_this) {
        return function(v) {
          return sprintf("%.2f%%", v * 100);
        };
      })(this)),
      start_angles: start_angles,
      end_angles: end_angles,
      text_angles: text_angles,
      colors: colors,
      text_colors: text_colors,
      text_cx: text_cx,
      text_cy: text_cy
    }
  });
  g1 = new models.AnnularWedge({
    x: cx,
    y: cy,
    inner_radius: inner_radius,
    outer_radius: outer_radius,
    start_angle: {
      field: "start_angles"
    },
    end_angle: {
      field: "end_angles"
    },
    line_color: null,
    line_width: 1,
    fill_color: {
      field: "colors"
    }
  });
  h1 = new models.AnnularWedge({
    x: cx,
    y: cy,
    inner_radius: inner_radius,
    outer_radius: outer_radius,
    start_angle: {
      field: "start_angles"
    },
    end_angle: {
      field: "end_angles"
    },
    line_color: null,
    line_width: 1,
    fill_color: {
      field: "colors"
    },
    fill_alpha: 0.8
  });
  r1 = new models.GlyphRenderer({
    data_source: source,
    glyph: g1,
    hover_glyph: h1
  });
  g2 = new models.Text({
    x: {
      field: "text_cx"
    },
    y: {
      field: "text_cy"
    },
    text: {
      field: (ref7 = opts.slice_labels) != null ? ref7 : "labels"
    },
    angle: {
      field: "text_angles"
    },
    text_align: "center",
    text_baseline: "middle",
    text_color: {
      field: "text_colors"
    },
    text_font_size: "9pt"
  });
  r2 = new models.GlyphRenderer({
    data_source: source,
    glyph: g2
  });
  xdr = new models.DataRange1d({
    renderers: [r1],
    range_padding: 0.2
  });
  ydr = new models.DataRange1d({
    renderers: [r1],
    range_padding: 0.2
  });
  plot = new models.Plot({
    x_range: xdr,
    y_range: ydr
  });
  if (opts.width != null) {
    plot.plot_width = opts.width;
  }
  if (opts.height != null) {
    plot.plot_height = opts.height;
  }
  plot.add_renderers(r1, r2);
  tooltip = "<div>@labels</div><div><b>@values</b> (@percentages)</div>";
  hover = new models.HoverTool({
    renderers: [r1],
    tooltips: tooltip
  });
  plot.add_tools(hover);
  return plot;
};

bar = function(data, opts) {
  var anchor, attachment, bottom, column_names, columns, dy, g1, hover, i, j, k, label, labels, left, len, len1, len2, len3, len4, m, n, name, o, orientation, p, palette, plot, q, r, r1, ref, ref1, ref2, ref3, ref4, ref5, ref6, ref7, ref8, renderers, right, row, rows, s, source, stacked, tooltip, top, v, xaxis, xdr, xformatter, yaxis, ydr;
  if (opts == null) {
    opts = {};
  }
  column_names = data[0];
  rows = data.slice(1);
  columns = (function() {
    var k, len, results;
    results = [];
    for (k = 0, len = column_names.length; k < len; k++) {
      name = column_names[k];
      results.push([]);
    }
    return results;
  })();
  for (k = 0, len = rows.length; k < len; k++) {
    row = rows[k];
    for (i = m = 0, len1 = row.length; m < len1; i = ++m) {
      v = row[i];
      columns[i].push(v);
    }
  }
  labels = _.map(columns[0], function(v) {
    return v.toString();
  });
  columns = columns.slice(1);
  yaxis = new models.CategoricalAxis();
  ydr = new models.FactorRange({
    factors: labels
  });
  if (opts.axis_number_format != null) {
    xformatter = new models.NumeralTickFormatter({
      format: opts.axis_number_format
    });
  } else {
    xformatter = new models.BasicTickFormatter();
  }
  xaxis = new models.LinearAxis({
    formatter: xformatter
  });
  xdr = new models.DataRange1d({
    start: 0
  });
  if (_.isArray(opts.palette)) {
    palette = opts.palette;
  } else {
    palette = palettes[(ref = opts.palette) != null ? ref : "Spectral11"].map(num2hexcolor);
  }
  stacked = (ref1 = opts.stacked) != null ? ref1 : false;
  orientation = (ref2 = opts.orientation) != null ? ref2 : "horizontal";
  renderers = [];
  if (stacked) {
    left = [];
    right = [];
    for (i = n = 0, ref3 = columns.length; 0 <= ref3 ? n < ref3 : n > ref3; i = 0 <= ref3 ? ++n : --n) {
      bottom = [];
      top = [];
      for (j = o = 0, len2 = labels.length; o < len2; j = ++o) {
        label = labels[j];
        if (i === 0) {
          left.push(0);
          right.push(columns[i][j]);
        } else {
          left[j] += columns[i - 1][j];
          right[j] += columns[i][j];
        }
        bottom.push(label + ":0");
        top.push(label + ":1");
      }
      source = new Bokeh.ColumnDataSource({
        data: {
          left: _.clone(left),
          right: _.clone(right),
          top: top,
          bottom: bottom,
          labels: labels,
          values: columns[i],
          columns: (function() {
            var len3, p, ref4, results;
            ref4 = columns[i];
            results = [];
            for (p = 0, len3 = ref4.length; p < len3; p++) {
              v = ref4[p];
              results.push(column_names[i + 1]);
            }
            return results;
          })()
        }
      });
      g1 = new models.Quad({
        left: {
          field: "left"
        },
        bottom: {
          field: "bottom"
        },
        right: {
          field: "right"
        },
        top: {
          field: "top"
        },
        line_color: null,
        fill_color: palette[i % palette.length]
      });
      r1 = new models.GlyphRenderer({
        data_source: source,
        glyph: g1
      });
      renderers.push(r1);
    }
  } else {
    dy = 1 / columns.length;
    for (i = p = 0, ref4 = columns.length; 0 <= ref4 ? p < ref4 : p > ref4; i = 0 <= ref4 ? ++p : --p) {
      left = [];
      right = [];
      bottom = [];
      top = [];
      for (j = q = 0, len3 = labels.length; q < len3; j = ++q) {
        label = labels[j];
        left.push(0);
        right.push(columns[i][j]);
        bottom.push(label + ":" + (i * dy));
        top.push(label + ":" + ((i + 1) * dy));
      }
      source = new Bokeh.ColumnDataSource({
        data: {
          left: left,
          right: right,
          top: top,
          bottom: bottom,
          labels: labels,
          values: columns[i],
          columns: (function() {
            var len4, ref5, results, s;
            ref5 = columns[i];
            results = [];
            for (s = 0, len4 = ref5.length; s < len4; s++) {
              v = ref5[s];
              results.push(column_names[i + 1]);
            }
            return results;
          })()
        }
      });
      g1 = new models.Quad({
        left: {
          field: "left"
        },
        bottom: {
          field: "bottom"
        },
        right: {
          field: "right"
        },
        top: {
          field: "top"
        },
        line_color: null,
        fill_color: palette[i % palette.length]
      });
      r1 = new models.GlyphRenderer({
        data_source: source,
        glyph: g1
      });
      renderers.push(r1);
    }
  }
  if (orientation === "vertical") {
    ref5 = [ydr, xdr], xdr = ref5[0], ydr = ref5[1];
    ref6 = [yaxis, xaxis], xaxis = ref6[0], yaxis = ref6[1];
    for (s = 0, len4 = renderers.length; s < len4; s++) {
      r = renderers[s];
      data = r.data_source.data;
      ref7 = [data.bottom, data.left], data.left = ref7[0], data.bottom = ref7[1];
      ref8 = [data.top, data.right], data.right = ref8[0], data.top = ref8[1];
    }
  }
  plot = new models.Plot({
    x_range: xdr,
    y_range: ydr
  });
  if (opts.width != null) {
    plot.plot_width = opts.width;
  }
  if (opts.height != null) {
    plot.plot_height = opts.height;
  }
  plot.add_renderers.apply(plot, renderers);
  plot.add_layout(yaxis, "left");
  plot.add_layout(xaxis, "below");
  tooltip = "<div>@labels</div><div>@columns:&nbsp<b>@values</b></div>";
  if (orientation === "horizontal") {
    anchor = "right_center";
    attachment = "horizontal";
  } else {
    anchor = "top_center";
    attachment = "vertical";
  }
  hover = new models.HoverTool({
    renderers: renderers,
    tooltips: tooltip,
    point_policy: "snap_to_data",
    anchor: anchor,
    attachment: attachment,
    show_arrow: opts.show_arrow
  });
  plot.add_tools(hover);
  return plot;
};

module.exports = {
  pie: pie,
  bar: bar
};
