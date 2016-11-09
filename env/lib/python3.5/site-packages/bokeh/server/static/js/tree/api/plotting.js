var $, BOKEH_ROOT, Document, Figure, _, _default_tools, _default_tooltips, _known_tools, _with_default, color, embed, figure, gridplot, models, show, sprintf,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  slice = [].slice,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

_ = require("underscore");

$ = require("jquery");

sprintf = require("sprintf");

Document = require("../document").Document;

embed = require("../embed");

BOKEH_ROOT = require("../embed").BOKEH_ROOT;

models = require("./models");

_default_tooltips = [["index", "$index"], ["data (x, y)", "($x, $y)"], ["canvas (x, y)", "($sx, $sy)"]];

_default_tools = "pan,wheel_zoom,box_zoom,save,reset,help";

_known_tools = {
  pan: function(plot) {
    return new models.PanTool({
      plot: plot,
      dimensions: 'both'
    });
  },
  xpan: function(plot) {
    return new models.PanTool({
      plot: plot,
      dimensions: 'width'
    });
  },
  ypan: function(plot) {
    return new models.PanTool({
      plot: plot,
      dimensions: 'height'
    });
  },
  wheel_zoom: function(plot) {
    return new models.WheelZoomTool({
      plot: plot,
      dimensions: 'both'
    });
  },
  xwheel_zoom: function(plot) {
    return new models.WheelZoomTool({
      plot: plot,
      dimensions: 'width'
    });
  },
  ywheel_zoom: function(plot) {
    return new models.WheelZoomTool({
      plot: plot,
      dimensions: 'height'
    });
  },
  zoom_in: function(plot) {
    return new models.ZoomInTool({
      plot: plot,
      dimensions: 'both'
    });
  },
  xzoom_in: function(plot) {
    return new models.ZoomInTool({
      plot: plot,
      dimensions: 'width'
    });
  },
  yzoom_in: function(plot) {
    return new models.ZoomInTool({
      plot: plot,
      dimensions: 'height'
    });
  },
  zoom_out: function(plot) {
    return new models.ZoomOutTool({
      plot: plot,
      dimensions: 'both'
    });
  },
  xzoom_out: function(plot) {
    return new models.ZoomOutTool({
      plot: plot,
      dimensions: 'width'
    });
  },
  yzoom_out: function(plot) {
    return new models.ZoomOutTool({
      plot: plot,
      dimensions: 'height'
    });
  },
  resize: function(plot) {
    return new models.ResizeTool({
      plot: plot
    });
  },
  click: function(plot) {
    return new models.TapTool({
      plot: plot,
      behavior: "inspect"
    });
  },
  tap: function(plot) {
    return new models.TapTool({
      plot: plot
    });
  },
  crosshair: function(plot) {
    return new models.CrosshairTool({
      plot: plot
    });
  },
  box_select: function(plot) {
    return new models.BoxSelectTool({
      plot: plot
    });
  },
  xbox_select: function(plot) {
    return new models.BoxSelectTool({
      plot: plot,
      dimensions: 'width'
    });
  },
  ybox_select: function(plot) {
    return new models.BoxSelectTool({
      plot: plot,
      dimensions: 'height'
    });
  },
  poly_select: function(plot) {
    return new models.PolySelectTool({
      plot: plot
    });
  },
  lasso_select: function(plot) {
    return new models.LassoSelectTool({
      plot: plot
    });
  },
  box_zoom: function(plot) {
    return new models.BoxZoomTool({
      plot: plot,
      dimensions: 'both'
    });
  },
  xbox_zoom: function(plot) {
    return new models.BoxZoomTool({
      plot: plot,
      dimensions: 'width'
    });
  },
  ybox_zoom: function(plot) {
    return new models.BoxZoomTool({
      plot: plot,
      dimensions: 'height'
    });
  },
  hover: function(plot) {
    return new models.HoverTool({
      plot: plot,
      tooltips: _default_tooltips
    });
  },
  save: function(plot) {
    return new models.SaveTool({
      plot: plot
    });
  },
  previewsave: function(plot) {
    return new models.SaveTool({
      plot: plot
    });
  },
  undo: function(plot) {
    return new models.UndoTool({
      plot: plot
    });
  },
  redo: function(plot) {
    return new models.RedoTool({
      plot: plot
    });
  },
  reset: function(plot) {
    return new models.ResetTool({
      plot: plot
    });
  },
  help: function(plot) {
    return new models.HelpTool({
      plot: plot
    });
  }
};

_with_default = function(value, default_value) {
  if (value === void 0) {
    return default_value;
  } else {
    return value;
  }
};

Figure = (function(superClass) {
  extend(Figure, superClass);

  function Figure(attributes, options) {
    var attrs, ref, ref1, ref2, ref3, ref4, ref5, tools, x_axis_label, x_axis_location, x_axis_type, x_minor_ticks, y_axis_label, y_axis_location, y_axis_type, y_minor_ticks;
    if (attributes == null) {
      attributes = {};
    }
    if (options == null) {
      options = {};
    }
    attrs = _.clone(attributes);
    tools = _with_default(attrs.tools, _default_tools);
    delete attrs.tools;
    attrs.x_range = this._get_range(attrs.x_range);
    attrs.y_range = this._get_range(attrs.y_range);
    x_axis_type = _.isUndefined(attrs.x_axis_type) ? "auto" : attrs.x_axis_type;
    y_axis_type = _.isUndefined(attrs.y_axis_type) ? "auto" : attrs.y_axis_type;
    delete attrs.x_axis_type;
    delete attrs.y_axis_type;
    x_minor_ticks = (ref = attrs.x_minor_ticks) != null ? ref : "auto";
    y_minor_ticks = (ref1 = attrs.y_minor_ticks) != null ? ref1 : "auto";
    delete attrs.x_minor_ticks;
    delete attrs.y_minor_ticks;
    x_axis_location = (ref2 = attrs.x_axis_location) != null ? ref2 : "below";
    y_axis_location = (ref3 = attrs.y_axis_location) != null ? ref3 : "left";
    delete attrs.x_axis_location;
    delete attrs.y_axis_location;
    x_axis_label = (ref4 = attrs.x_axis_label) != null ? ref4 : "";
    y_axis_label = (ref5 = attrs.y_axis_label) != null ? ref5 : "";
    delete attrs.x_axis_label;
    delete attrs.y_axis_label;
    if (!_.isUndefined(attrs.width)) {
      if (_.isUndefined(attrs.plot_width)) {
        attrs.plot_width = attrs.width;
      } else {
        throw new Error("both 'width' and 'plot_width' can't be given at the same time");
      }
      delete attrs.width;
    }
    if (!_.isUndefined(attrs.height)) {
      if (_.isUndefined(attrs.plot_height)) {
        attrs.plot_height = attrs.height;
      } else {
        throw new Error("both 'height' and 'plot_height' can't be given at the same time");
      }
      delete attrs.height;
    }
    Figure.__super__.constructor.call(this, attrs, options);
    this._process_guides(0, x_axis_type, x_axis_location, x_minor_ticks, x_axis_label);
    this._process_guides(1, y_axis_type, y_axis_location, y_minor_ticks, y_axis_label);
    this.add_tools.apply(this, this._process_tools(tools));
    this._legend = new models.Legend({
      plot: this,
      items: []
    });
    this.add_renderers(this._legend);
  }

  Object.defineProperty(Figure.prototype, "xgrid", {
    get: function() {
      return this.renderers.filter(function(r) {
        return r instanceof models.Grid && r.dimension === 0;
      })[0];
    }
  });

  Object.defineProperty(Figure.prototype, "ygrid", {
    get: function() {
      return this.renderers.filter(function(r) {
        return r instanceof models.Grid && r.dimension === 1;
      })[0];
    }
  });

  Object.defineProperty(Figure.prototype, "xaxis", {
    get: function() {
      return this.below.concat(this.above).filter(function(r) {
        return r instanceof models.Axis;
      })[0];
    }
  });

  Object.defineProperty(Figure.prototype, "yaxis", {
    get: function() {
      return this.left.concat(this.right).filter(function(r) {
        return r instanceof models.Axis;
      })[0];
    }
  });

  Figure.prototype.annular_wedge = function() {
    var args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return this._glyph(models.AnnularWedge, "x,y,inner_radius,outer_radius,start_angle,end_angle", args);
  };

  Figure.prototype.annulus = function() {
    var args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return this._glyph(models.Annulus, "x,y,inner_radius,outer_radius", args);
  };

  Figure.prototype.arc = function() {
    var args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return this._glyph(models.Arc, "x,y,radius,start_angle,end_angle", args);
  };

  Figure.prototype.bezier = function() {
    var args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return this._glyph(models.Bezier, "x0,y0,x1,y1,cx0,cy0,cx1,cy1", args);
  };

  Figure.prototype.circle = function() {
    var args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return this._glyph(models.Circle, "x,y", args);
  };

  Figure.prototype.ellipse = function() {
    var args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return this._glyph(models.Ellipse, "x,y,width,height", args);
  };

  Figure.prototype.image = function() {
    var args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return this._glyph(models.Image, "color_mapper,image,rows,cols,x,y,dw,dh", args);
  };

  Figure.prototype.image_rgba = function() {
    var args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return this._glyph(models.ImageRGBA, "image,rows,cols,x,y,dw,dh", args);
  };

  Figure.prototype.image_url = function() {
    var args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return this._glyph(models.ImageURL, "url,x,y,w,h", args);
  };

  Figure.prototype.line = function() {
    var args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return this._glyph(models.Line, "x,y", args);
  };

  Figure.prototype.multi_line = function() {
    var args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return this._glyph(models.MultiLine, "xs,ys", args);
  };

  Figure.prototype.oval = function() {
    var args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return this._glyph(models.Oval, "x,y,width,height", args);
  };

  Figure.prototype.patch = function() {
    var args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return this._glyph(models.Patch, "x,y", args);
  };

  Figure.prototype.patches = function() {
    var args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return this._glyph(models.Patches, "xs,ys", args);
  };

  Figure.prototype.quad = function() {
    var args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return this._glyph(models.Quad, "left,right,bottom,top", args);
  };

  Figure.prototype.quadratic = function() {
    var args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return this._glyph(models.Quadratic, "x0,y0,x1,y1,cx,cy", args);
  };

  Figure.prototype.ray = function() {
    var args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return this._glyph(models.Ray, "x,y,length", args);
  };

  Figure.prototype.rect = function() {
    var args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return this._glyph(models.Rect, "x,y,width,height", args);
  };

  Figure.prototype.segment = function() {
    var args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return this._glyph(models.Segment, "x0,y0,x1,y1", args);
  };

  Figure.prototype.text = function() {
    var args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return this._glyph(models.Text, "x,y,text", args);
  };

  Figure.prototype.wedge = function() {
    var args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return this._glyph(models.Wedge, "x,y,radius,start_angle,end_angle", args);
  };

  Figure.prototype.asterisk = function() {
    var args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return this._marker(models.Asterisk, args);
  };

  Figure.prototype.circle_cross = function() {
    var args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return this._marker(models.CircleCross, args);
  };

  Figure.prototype.circle_x = function() {
    var args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return this._marker(models.CircleX, args);
  };

  Figure.prototype.cross = function() {
    var args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return this._marker(models.Cross, args);
  };

  Figure.prototype.diamond = function() {
    var args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return this._marker(models.Diamond, args);
  };

  Figure.prototype.diamond_cross = function() {
    var args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return this._marker(models.DiamondCross, args);
  };

  Figure.prototype.inverted_triangle = function() {
    var args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return this._marker(models.InvertedTriangle, args);
  };

  Figure.prototype.square = function() {
    var args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return this._marker(models.Square, args);
  };

  Figure.prototype.square_cross = function() {
    var args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return this._marker(models.SquareCross, args);
  };

  Figure.prototype.square_x = function() {
    var args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return this._marker(models.SquareX, args);
  };

  Figure.prototype.triangle = function() {
    var args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return this._marker(models.Triangle, args);
  };

  Figure.prototype.x = function() {
    var args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return this._marker(models.X, args);
  };

  Figure.prototype._vectorable = ["fill_color", "fill_alpha", "line_color", "line_alpha", "line_width", "text_color", "text_alpha", "text_font_size"];

  Figure.prototype._default_color = "#1f77b4";

  Figure.prototype._default_alpha = 1.0;

  Figure.prototype._pop_colors_and_alpha = function(cls, attrs, prefix, default_color, default_alpha) {
    var _update_with, alpha, color, result;
    if (prefix == null) {
      prefix = "";
    }
    if (default_color == null) {
      default_color = this._default_color;
    }
    if (default_alpha == null) {
      default_alpha = this._default_alpha;
    }
    result = {};
    color = _with_default(attrs[prefix + "color"], default_color);
    alpha = _with_default(attrs[prefix + "alpha"], default_alpha);
    delete attrs[prefix + "color"];
    delete attrs[prefix + "alpha"];
    _update_with = function(name, default_value) {
      if (cls.prototype.props[name] != null) {
        result[name] = _with_default(attrs[prefix + name], default_value);
        return delete attrs[prefix + name];
      }
    };
    _update_with("fill_color", color);
    _update_with("line_color", color);
    _update_with("text_color", "black");
    _update_with("fill_alpha", alpha);
    _update_with("line_alpha", alpha);
    _update_with("text_alpha", alpha);
    return result;
  };

  Figure.prototype._find_uniq_name = function(data, name) {
    var i, new_name;
    i = 1;
    while (true) {
      new_name = name + "__" + i;
      if (data[new_name] != null) {
        i += 1;
      } else {
        return new_name;
      }
    }
  };

  Figure.prototype._fixup_values = function(cls, data, attrs) {
    var name, results, value;
    results = [];
    for (name in attrs) {
      value = attrs[name];
      results.push((function(_this) {
        return function(name, value) {
          var field, prop;
          prop = cls.prototype.props[name];
          if (prop != null) {
            if (prop.type.prototype.dataspec) {
              if (value != null) {
                if (_.isArray(value)) {
                  if (data[name] != null) {
                    if (data[name] !== value) {
                      field = _this._find_uniq_name(data, name);
                      data[field] = value;
                    } else {
                      field = name;
                    }
                  } else {
                    field = name;
                    data[field] = value;
                  }
                  return attrs[name] = {
                    field: field
                  };
                } else if (_.isNumber(value) || _.isString(value)) {
                  return attrs[name] = {
                    value: value
                  };
                }
              }
            }
          }
        };
      })(this)(name, value));
    }
    return results;
  };

  Figure.prototype._glyph = function(cls, params, args) {
    var _make_glyph, attrs, data, fn, glyph, glyph_ca, glyph_renderer, has_hglyph, has_sglyph, hglyph, hglyph_ca, i, j, k, legend, len, nsglyph, nsglyph_ca, opts, param, ref, ref1, sglyph, sglyph_ca, source;
    params = params.split(",");
    if (args.length === 1) {
      attrs = args[0];
      attrs = _.clone(attrs);
    } else {
      ref = args, args = 2 <= ref.length ? slice.call(ref, 0, j = ref.length - 1) : (j = 0, []), opts = ref[j++];
      attrs = _.clone(opts);
      fn = function(param, i) {
        return attrs[param] = args[i];
      };
      for (i = k = 0, len = params.length; k < len; i = ++k) {
        param = params[i];
        fn(param, i);
      }
    }
    legend = this._process_legend(attrs.legend, attrs.source);
    delete attrs.legend;
    has_sglyph = _.any(_.keys(attrs), function(key) {
      return key.startsWith("selection_");
    });
    has_hglyph = _.any(_.keys(attrs), function(key) {
      return key.startsWith("hover_");
    });
    glyph_ca = this._pop_colors_and_alpha(cls, attrs);
    nsglyph_ca = this._pop_colors_and_alpha(cls, attrs, "nonselection_", void 0, 0.1);
    sglyph_ca = has_sglyph ? this._pop_colors_and_alpha(cls, attrs, "selection_") : {};
    hglyph_ca = has_hglyph ? this._pop_colors_and_alpha(cls, attrs, "hover_") : {};
    source = (ref1 = attrs.source) != null ? ref1 : new models.ColumnDataSource();
    data = _.clone(source.data);
    delete attrs.source;
    this._fixup_values(cls, data, glyph_ca);
    this._fixup_values(cls, data, nsglyph_ca);
    this._fixup_values(cls, data, sglyph_ca);
    this._fixup_values(cls, data, hglyph_ca);
    this._fixup_values(cls, data, attrs);
    source.data = data;
    _make_glyph = (function(_this) {
      return function(cls, attrs, extra_attrs) {
        return new cls(_.extend({}, attrs, extra_attrs));
      };
    })(this);
    glyph = _make_glyph(cls, attrs, glyph_ca);
    nsglyph = _make_glyph(cls, attrs, nsglyph_ca);
    sglyph = has_sglyph ? _make_glyph(cls, attrs, sglyph_ca) : null;
    hglyph = has_hglyph ? _make_glyph(cls, attrs, hglyph_ca) : null;
    glyph_renderer = new models.GlyphRenderer({
      data_source: source,
      glyph: glyph,
      nonselection_glyph: nsglyph,
      selection_glyph: sglyph,
      hover_glyph: hglyph
    });
    if (legend != null) {
      this._update_legend(legend, glyph_renderer);
    }
    this.add_renderers(glyph_renderer);
    return glyph_renderer;
  };

  Figure.prototype._marker = function(cls, args) {
    return this._glyph(cls, "x,y", args);
  };

  Figure.prototype._get_range = function(range) {
    if (range == null) {
      return new models.DataRange1d();
    }
    if (range instanceof models.Range) {
      return range;
    }
    if (_.isArray(range)) {
      if (_.all(function(x) {
        var j, len, results;
        results = [];
        for (j = 0, len = range.length; j < len; j++) {
          x = range[j];
          results.push(_.isString(x));
        }
        return results;
      })) {
        return new models.FactorRange({
          factors: range
        });
      }
      if (range.length === 2) {
        return new models.Range1d({
          start: range[0],
          end: range[1]
        });
      }
    }
  };

  Figure.prototype._process_guides = function(dim, axis_type, axis_location, minor_ticks, axis_label) {
    var axis, axiscls, grid, range;
    range = dim === 0 ? this.x_range : this.y_range;
    axiscls = this._get_axis_class(axis_type, range);
    if (axiscls != null) {
      if (axiscls === models.LogAxis) {
        if (dim === 0) {
          this.x_mapper_type = 'log';
        } else {
          this.y_mapper_type = 'log';
        }
      }
      axis = new axiscls();
      if (axis.ticker instanceof models.ContinuousTicker) {
        axis.ticker.num_minor_ticks = this._get_num_minor_ticks(axiscls, minor_ticks);
      }
      if (axis_label.length !== 0) {
        axis.axis_label = axis_label;
      }
      grid = new models.Grid({
        dimension: dim,
        ticker: axis.ticker
      });
      this.add_layout(axis, axis_location);
      return this.add_layout(grid);
    }
  };

  Figure.prototype._get_axis_class = function(axis_type, range) {
    if (axis_type == null) {
      return null;
    }
    if (axis_type === "linear") {
      return models.LinearAxis;
    }
    if (axis_type === "log") {
      return models.LogAxis;
    }
    if (axis_type === "datetime") {
      return models.DatetimeAxis;
    }
    if (axis_type === "auto") {
      if (range instanceof models.FactorRange) {
        return models.CategoricalAxis;
      } else {
        return models.LinearAxis;
      }
    }
  };

  Figure.prototype._get_num_minor_ticks = function(axis_class, num_minor_ticks) {
    if (_.isNumber(num_minor_ticks)) {
      if (num_minor_ticks <= 1) {
        throw new Error("num_minor_ticks must be > 1");
      }
      return num_minor_ticks;
    }
    if (num_minor_ticks == null) {
      return 0;
    }
    if (num_minor_ticks === 'auto') {
      if (axis_class === models.LogAxis) {
        return 10;
      }
      return 5;
    }
  };

  Figure.prototype._process_tools = function(tools) {
    var objs, tool;
    if (_.isString(tools)) {
      tools = tools.split(/\s*,\s*/);
    }
    objs = (function() {
      var j, len, results;
      results = [];
      for (j = 0, len = tools.length; j < len; j++) {
        tool = tools[j];
        if (_.isString(tool)) {
          results.push(_known_tools[tool](this));
        } else {
          results.push(tool);
        }
      }
      return results;
    }).call(this);
    return objs;
  };

  Figure.prototype._process_legend = function(legend, source) {
    var legend_item_label;
    legend_item_label = null;
    if (legend != null) {
      if (_.isString(legend)) {
        legend_item_label = {
          value: legend
        };
        if ((source != null) && (source.column_names != null)) {
          if (indexOf.call(source.column_names, legend) >= 0) {
            legend_item_label = {
              field: legend
            };
          }
        }
      } else {
        legend_item_label = legend;
      }
    }
    return legend_item_label;
  };

  Figure.prototype._update_legend = function(legend_item_label, glyph_renderer) {
    var added, item, j, len, new_item, ref;
    added = false;
    ref = this._legend.items;
    for (j = 0, len = ref.length; j < len; j++) {
      item = ref[j];
      if (_.isEqual(item.label, legend_item_label)) {
        if (item.label.value != null) {
          item.renderers.push(glyph_renderer);
          added = true;
          break;
        }
        if ((item.label.field != null) && glyph_renderer.data_source === item.renderers[0].data_source) {
          item.renderers.push(glyph_renderer);
          added = true;
          break;
        }
      }
    }
    if (!added) {
      new_item = new models.LegendItem({
        label: legend_item_label,
        renderers: [glyph_renderer]
      });
      return this._legend.items.push(new_item);
    }
  };

  return Figure;

})(models.Plot);

figure = function(attributes, options) {
  if (attributes == null) {
    attributes = {};
  }
  if (options == null) {
    options = {};
  }
  return new Figure(attributes, options);
};

show = function(obj, target) {
  var _obj, div, doc, j, len, multiple, views;
  multiple = _.isArray(obj);
  doc = new Document();
  if (!multiple) {
    doc.add_root(obj);
  } else {
    for (j = 0, len = obj.length; j < len; j++) {
      _obj = obj[j];
      doc.add_root(_obj);
    }
  }
  div = $("<div class=" + BOKEH_ROOT + ">");
  $(target != null ? target : "body").append(div);
  views = embed.add_document_standalone(doc, div);
  if (!multiple) {
    return views[obj.id];
  } else {
    return views;
  }
};

color = function(r, g, b) {
  return sprintf("#%02x%02x%02x", r, g, b);
};

gridplot = function(children, options) {
  var grid, item, j, k, l, layout, len, len1, len2, neighbor, row, row_children, row_tools, rows, sizing_mode, toolbar, toolbar_location, toolbar_sizing_mode, tools;
  if (options == null) {
    options = {};
  }
  toolbar_location = _.isUndefined(options.toolbar_location) ? 'above' : options.toolbar_location;
  sizing_mode = _.isUndefined(options.sizing_mode) ? 'fixed' : options.sizing_mode;
  toolbar_sizing_mode = options.sizing_mode === 'fixed' ? 'scale_width' : sizing_mode;
  tools = [];
  rows = [];
  for (j = 0, len = children.length; j < len; j++) {
    row = children[j];
    row_tools = [];
    row_children = [];
    for (k = 0, len1 = row.length; k < len1; k++) {
      item = row[k];
      if (item instanceof models.Plot) {
        row_tools = row_tools.concat(item.toolbar.tools);
        item.toolbar_location = null;
      }
      if (item === null) {
        for (l = 0, len2 = row.length; l < len2; l++) {
          neighbor = row[l];
          if (neighbor instanceof models.Plot) {
            break;
          }
        }
        item = new models.Spacer({
          width: neighbor.plot_width,
          height: neighbor.plot_height
        });
      }
      if (item instanceof models.LayoutDOM) {
        item.sizing_mode = sizing_mode;
        row_children.push(item);
      } else {
        throw new Error("only LayoutDOM items can be inserted into Grid");
      }
    }
    tools = tools.concat(row_tools);
    row = new models.Row({
      children: row_children,
      sizing_mode: sizing_mode
    });
    rows.push(row);
  }
  grid = new models.Column({
    children: rows,
    sizing_mode: sizing_mode
  });
  layout = (function() {
    if (toolbar_location) {
      toolbar = new models.ToolbarBox({
        tools: tools,
        sizing_mode: toolbar_sizing_mode,
        toolbar_location: toolbar_location
      });
      switch (toolbar_location) {
        case 'above':
          return new models.Column({
            children: [toolbar, grid],
            sizing_mode: sizing_mode
          });
        case 'below':
          return new models.Column({
            children: [grid, toolbar],
            sizing_mode: sizing_mode
          });
        case 'left':
          return new models.Row({
            children: [toolbar, grid],
            sizing_mode: sizing_mode
          });
        case 'right':
          return new models.Row({
            children: [grid, toolbar],
            sizing_mode: sizing_mode
          });
      }
    } else {
      return grid;
    }
  })();
  return layout;
};

module.exports = {
  Figure: Figure,
  figure: figure,
  show: show,
  color: color,
  gridplot: gridplot
};
