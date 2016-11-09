var $, GlyphRenderer, HoverTool, HoverToolView, InspectTool, Tooltip, _, _color_to_hex, hittest, logger, p, replace_placeholders,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

$ = require("jquery");

InspectTool = require("./inspect_tool");

Tooltip = require("../../annotations/tooltip");

GlyphRenderer = require("../../renderers/glyph_renderer");

hittest = require("../../../core/hittest");

logger = require("../../../core/logging").logger;

replace_placeholders = require("../../../core/util/templating").replace_placeholders;

p = require("../../../core/properties");

_color_to_hex = function(color) {
  var blue, digits, green, red, rgb;
  if (color.substr(0, 1) === '#') {
    return color;
  }
  digits = /(.*?)rgb\((\d+), (\d+), (\d+)\)/.exec(color);
  red = parseInt(digits[2]);
  green = parseInt(digits[3]);
  blue = parseInt(digits[4]);
  rgb = blue | (green << 8) | (red << 16);
  return digits[1] + '#' + rgb.toString(16);
};

HoverToolView = (function(superClass) {
  extend(HoverToolView, superClass);

  function HoverToolView() {
    return HoverToolView.__super__.constructor.apply(this, arguments);
  }

  HoverToolView.prototype.bind_bokeh_events = function() {
    var k, len, r, ref;
    ref = this.model.computed_renderers;
    for (k = 0, len = ref.length; k < len; k++) {
      r = ref[k];
      this.listenTo(r.data_source, 'inspect', this._update);
    }
    return this.plot_view.canvas_view.$el.css('cursor', 'crosshair');
  };

  HoverToolView.prototype._clear = function() {
    var ref, results, rid, tt;
    this._inspect(2e308, 2e308);
    ref = this.model.ttmodels;
    results = [];
    for (rid in ref) {
      tt = ref[rid];
      results.push(tt.clear());
    }
    return results;
  };

  HoverToolView.prototype._move = function(e) {
    var canvas, vx, vy;
    if (!this.model.active) {
      return;
    }
    canvas = this.plot_view.canvas;
    vx = canvas.sx_to_vx(e.bokeh.sx);
    vy = canvas.sy_to_vy(e.bokeh.sy);
    if (!this.plot_view.frame.contains(vx, vy)) {
      return this._clear();
    } else {
      return this._inspect(vx, vy);
    }
  };

  HoverToolView.prototype._move_exit = function() {
    return this._clear();
  };

  HoverToolView.prototype._inspect = function(vx, vy, e) {
    var geometry, hovered_indexes, hovered_renderers, k, len, r, ref, sm;
    geometry = {
      type: 'point',
      vx: vx,
      vy: vy
    };
    if (this.model.mode === 'mouse') {
      geometry['type'] = 'point';
    } else {
      geometry['type'] = 'span';
      if (this.model.mode === 'vline') {
        geometry.direction = 'h';
      } else {
        geometry.direction = 'v';
      }
    }
    hovered_indexes = [];
    hovered_renderers = [];
    ref = this.model.computed_renderers;
    for (k = 0, len = ref.length; k < len; k++) {
      r = ref[k];
      sm = r.data_source.selection_manager;
      sm.inspect(this, this.plot_view.renderer_views[r.id], geometry, {
        "geometry": geometry
      });
    }
    if (this.model.callback != null) {
      this._emit_callback(geometry);
    }
  };

  HoverToolView.prototype._update = function(indices, tool, renderer, ds, arg) {
    var canvas, d1x, d1y, d2x, d2y, data_x, data_y, dist1, dist2, frame, geometry, i, j, k, l, len, len1, len2, m, pair, pt, ref, ref1, ref10, ref11, ref12, ref13, ref14, ref15, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, rx, ry, sdatax, sdatay, sx, sy, tooltip, vars, vx, vy, x, xmapper, y, ymapper;
    geometry = arg.geometry;
    tooltip = (ref = this.model.ttmodels[renderer.model.id]) != null ? ref : null;
    if (tooltip == null) {
      return;
    }
    tooltip.clear();
    if (indices['0d'].glyph === null && indices['1d'].indices.length === 0) {
      return;
    }
    vx = geometry.vx;
    vy = geometry.vy;
    canvas = this.plot_model.canvas;
    frame = this.plot_model.frame;
    sx = canvas.vx_to_sx(vx);
    sy = canvas.vy_to_sy(vy);
    xmapper = frame.x_mappers[renderer.model.x_range_name];
    ymapper = frame.y_mappers[renderer.model.y_range_name];
    x = xmapper.map_from_target(vx);
    y = ymapper.map_from_target(vy);
    ref1 = indices['0d'].indices;
    for (k = 0, len = ref1.length; k < len; k++) {
      i = ref1[k];
      data_x = renderer.glyph._x[i + 1];
      data_y = renderer.glyph._y[i + 1];
      switch (this.model.line_policy) {
        case "interp":
          ref2 = renderer.glyph.get_interpolation_hit(i, geometry), data_x = ref2[0], data_y = ref2[1];
          rx = xmapper.map_to_target(data_x);
          ry = ymapper.map_to_target(data_y);
          break;
        case "prev":
          rx = canvas.sx_to_vx(renderer.glyph.sx[i]);
          ry = canvas.sy_to_vy(renderer.glyph.sy[i]);
          break;
        case "next":
          rx = canvas.sx_to_vx(renderer.glyph.sx[i + 1]);
          ry = canvas.sy_to_vy(renderer.glyph.sy[i + 1]);
          break;
        case "nearest":
          d1x = renderer.glyph.sx[i];
          d1y = renderer.glyph.sy[i];
          dist1 = hittest.dist_2_pts(d1x, d1y, sx, sy);
          d2x = renderer.glyph.sx[i + 1];
          d2y = renderer.glyph.sy[i + 1];
          dist2 = hittest.dist_2_pts(d2x, d2y, sx, sy);
          if (dist1 < dist2) {
            ref3 = [d1x, d1y], sdatax = ref3[0], sdatay = ref3[1];
          } else {
            ref4 = [d2x, d2y], sdatax = ref4[0], sdatay = ref4[1];
            i = i + 1;
          }
          data_x = renderer.glyph._x[i];
          data_y = renderer.glyph._y[i];
          rx = canvas.sx_to_vx(sdatax);
          ry = canvas.sy_to_vy(sdatay);
          break;
        default:
          ref5 = [vx, vy], rx = ref5[0], ry = ref5[1];
      }
      vars = {
        index: i,
        x: x,
        y: y,
        vx: vx,
        vy: vy,
        sx: sx,
        sy: sy,
        data_x: data_x,
        data_y: data_y,
        rx: rx,
        ry: ry
      };
      tooltip.add(rx, ry, this._render_tooltips(ds, i, vars));
    }
    ref6 = indices['1d'].indices;
    for (l = 0, len1 = ref6.length; l < len1; l++) {
      i = ref6[l];
      if (!_.isEmpty(indices['2d'])) {
        ref7 = _.pairs(indices['2d']);
        for (m = 0, len2 = ref7.length; m < len2; m++) {
          pair = ref7[m];
          ref8 = [pair[0], pair[1][0]], i = ref8[0], j = ref8[1];
          data_x = renderer.glyph._xs[i][j];
          data_y = renderer.glyph._ys[i][j];
          switch (this.model.line_policy) {
            case "interp":
              ref9 = renderer.glyph.get_interpolation_hit(i, j, geometry), data_x = ref9[0], data_y = ref9[1];
              rx = xmapper.map_to_target(data_x);
              ry = ymapper.map_to_target(data_y);
              break;
            case "prev":
              rx = canvas.sx_to_vx(renderer.glyph.sxs[i][j]);
              ry = canvas.sy_to_vy(renderer.glyph.sys[i][j]);
              break;
            case "next":
              rx = canvas.sx_to_vx(renderer.glyph.sxs[i][j + 1]);
              ry = canvas.sy_to_vy(renderer.glyph.sys[i][j + 1]);
              break;
            case "nearest":
              d1x = renderer.glyph.sx[i][j];
              d1y = renderer.glyph.sy[i][j];
              dist1 = hittest.dist_2_pts(d1x, d1y, sx, sy);
              d2x = renderer.glyph.sx[i][j + 1];
              d2y = renderer.glyph.sy[i][j + 1];
              dist2 = hittest.dist_2_pts(d2x, d2y, sx, sy);
              if (dist1 < dist2) {
                ref10 = [d1x, d1y], sdatax = ref10[0], sdatay = ref10[1];
              } else {
                ref11 = [d2x, d2y], sdatax = ref11[0], sdatay = ref11[1];
                j = j + 1;
              }
              data_x = renderer.glyph._x[i][j];
              data_y = renderer.glyph._y[i][j];
              rx = canvas.sx_to_vx(sdatax);
              ry = canvas.sy_to_vy(sdatay);
          }
          vars = {
            index: i,
            segment_index: j,
            x: x,
            y: y,
            vx: vx,
            vy: vy,
            sx: sx,
            sy: sy,
            data_x: data_x,
            data_y: data_y
          };
          tooltip.add(rx, ry, this._render_tooltips(ds, i, vars));
        }
      } else {
        data_x = (ref12 = renderer.glyph._x) != null ? ref12[i] : void 0;
        data_y = (ref13 = renderer.glyph._y) != null ? ref13[i] : void 0;
        if (this.model.point_policy === 'snap_to_data') {
          pt = renderer.glyph.get_anchor_point(this.model.anchor, i, [sx, sy]);
          if (pt != null) {
            x = pt.x, y = pt.y;
          } else {
            ref14 = renderer.glyph.get_anchor_point("center", i, [sx, sy]), x = ref14.x, y = ref14.y;
          }
          rx = canvas.sx_to_vx(x);
          ry = canvas.sy_to_vy(y);
        } else {
          ref15 = [vx, vy], rx = ref15[0], ry = ref15[1];
        }
        vars = {
          index: i,
          x: x,
          y: y,
          vx: vx,
          vy: vy,
          sx: sx,
          sy: sy,
          data_x: data_x,
          data_y: data_y
        };
        tooltip.add(rx, ry, this._render_tooltips(ds, i, vars));
      }
    }
    return null;
  };

  HoverToolView.prototype._emit_callback = function(geometry) {
    var callback, canvas, data, frame, indices, obj, r, ref, xmapper, ymapper;
    r = this.model.computed_renderers[0];
    indices = this.plot_view.renderer_views[r.id].hit_test(geometry);
    canvas = this.plot_model.canvas;
    frame = this.plot_model.frame;
    geometry['sx'] = canvas.vx_to_sx(geometry.vx);
    geometry['sy'] = canvas.vy_to_sy(geometry.vy);
    xmapper = frame.x_mappers[r.x_range_name];
    ymapper = frame.y_mappers[r.y_range_name];
    geometry['x'] = xmapper.map_from_target(geometry.vx);
    geometry['y'] = ymapper.map_from_target(geometry.vy);
    callback = this.model.callback;
    ref = [
      callback, {
        index: indices,
        geometry: geometry
      }
    ], obj = ref[0], data = ref[1];
    if (_.isFunction(callback)) {
      callback(obj, data);
    } else {
      callback.execute(obj, data);
    }
  };

  HoverToolView.prototype._render_tooltips = function(ds, i, vars) {
    var colname, color, column, hex, k, label, len, match, opts, ref, ref1, row, span, swatch, table, td, tooltips, value;
    tooltips = this.model.tooltips;
    if (_.isString(tooltips)) {
      return $('<div>').html(replace_placeholders(tooltips, ds, i, vars));
    } else if (_.isFunction(tooltips)) {
      return tooltips(ds, vars);
    } else {
      table = $('<table></table>');
      for (k = 0, len = tooltips.length; k < len; k++) {
        ref = tooltips[k], label = ref[0], value = ref[1];
        row = $("<tr></tr>");
        row.append($("<td class='bk-tooltip-row-label'>").text(label + ": "));
        td = $("<td class='bk-tooltip-row-value'></td>");
        if (value.indexOf("$color") >= 0) {
          ref1 = value.match(/\$color(\[.*\])?:(\w*)/), match = ref1[0], opts = ref1[1], colname = ref1[2];
          column = ds.get_column(colname);
          if (column == null) {
            span = $("<span>").text(colname + " unknown");
            td.append(span);
            continue;
          }
          hex = (opts != null ? opts.indexOf("hex") : void 0) >= 0;
          swatch = (opts != null ? opts.indexOf("swatch") : void 0) >= 0;
          color = column[i];
          if (color == null) {
            span = $("<span>(null)</span>");
            td.append(span);
            continue;
          }
          if (hex) {
            color = _color_to_hex(color);
          }
          span = $("<span>").text(color);
          td.append(span);
          if (swatch) {
            span = $("<span class='bk-tooltip-color-block'> </span>");
            span.css({
              backgroundColor: color
            });
          }
          td.append(span);
        } else {
          value = value.replace("$~", "$data_");
          value = replace_placeholders(value, ds, i, vars);
          td.append($('<span>').html(value));
        }
        row.append(td);
        table.append(row);
      }
      return table;
    }
  };

  return HoverToolView;

})(InspectTool.View);

HoverTool = (function(superClass) {
  extend(HoverTool, superClass);

  function HoverTool() {
    return HoverTool.__super__.constructor.apply(this, arguments);
  }

  HoverTool.prototype.default_view = HoverToolView;

  HoverTool.prototype.type = "HoverTool";

  HoverTool.prototype.tool_name = "Hover Tool";

  HoverTool.prototype.icon = "bk-tool-icon-hover";

  HoverTool.define({
    tooltips: [p.Any, [["index", "$index"], ["data (x, y)", "($x, $y)"], ["canvas (x, y)", "($sx, $sy)"]]],
    renderers: [p.Array, []],
    names: [p.Array, []],
    mode: [p.String, 'mouse'],
    point_policy: [p.String, 'snap_to_data'],
    line_policy: [p.String, 'prev'],
    show_arrow: [p.Boolean, true],
    anchor: [p.String, 'center'],
    attachment: [p.String, 'horizontal'],
    callback: [p.Any]
  });

  HoverTool.prototype.initialize = function(attrs, options) {
    HoverTool.__super__.initialize.call(this, attrs, options);
    this.define_computed_property('computed_renderers', function() {
      var all_renderers, names, r, renderers;
      renderers = this.renderers;
      names = this.names;
      if (renderers.length === 0) {
        all_renderers = this.plot.renderers;
        renderers = (function() {
          var k, len, results;
          results = [];
          for (k = 0, len = all_renderers.length; k < len; k++) {
            r = all_renderers[k];
            if (r instanceof GlyphRenderer.Model) {
              results.push(r);
            }
          }
          return results;
        })();
      }
      if (names.length > 0) {
        renderers = (function() {
          var k, len, results;
          results = [];
          for (k = 0, len = renderers.length; k < len; k++) {
            r = renderers[k];
            if (names.indexOf(r.name) >= 0) {
              results.push(r);
            }
          }
          return results;
        })();
      }
      return renderers;
    }, true);
    this.add_dependencies('computed_renderers', this, ['renderers', 'names', 'plot']);
    this.add_dependencies('computed_renderers', this.plot, ['renderers']);
    this.define_computed_property('ttmodels', function() {
      var k, len, r, ref, tooltip, tooltips, ttmodels;
      ttmodels = {};
      tooltips = this.tooltips;
      if (tooltips != null) {
        ref = this.computed_renderers;
        for (k = 0, len = ref.length; k < len; k++) {
          r = ref[k];
          tooltip = new Tooltip.Model({
            custom: _.isString(tooltips) || _.isFunction(tooltips),
            attachment: this.attachment,
            show_arrow: this.show_arrow
          });
          ttmodels[r.id] = tooltip;
        }
      }
      return ttmodels;
    });
    return this.add_dependencies('ttmodels', this, ['computed_renderers', 'tooltips']);
  };

  HoverTool.getters({
    computed_renderers: function() {
      return this._get_computed('computed_renderers');
    },
    ttmodels: function() {
      return this._get_computed('ttmodels');
    },
    synthetic_renderers: function() {
      return _.values(this.ttmodels);
    }
  });

  return HoverTool;

})(InspectTool.Model);

module.exports = {
  Model: HoverTool,
  View: HoverToolView
};
