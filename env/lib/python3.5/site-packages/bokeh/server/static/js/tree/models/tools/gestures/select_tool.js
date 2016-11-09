var GestureTool, GlyphRenderer, SelectTool, SelectToolView, _, logger, p,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

GestureTool = require("./gesture_tool");

GlyphRenderer = require("../../renderers/glyph_renderer");

logger = require("../../../core/logging").logger;

p = require("../../../core/properties");

SelectToolView = (function(superClass) {
  extend(SelectToolView, superClass);

  function SelectToolView() {
    return SelectToolView.__super__.constructor.apply(this, arguments);
  }

  SelectToolView.prototype._keyup = function(e) {
    var ds, j, len, r, ref, results, sm;
    if (e.keyCode === 27) {
      ref = this.model.computed_renderers;
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        r = ref[j];
        ds = r.data_source;
        sm = ds.selection_manager;
        results.push(sm.clear());
      }
      return results;
    }
  };

  SelectToolView.prototype._save_geometry = function(geometry, final, append) {
    var g, geoms, i, j, ref, tool_events, xm, ym;
    g = _.clone(geometry);
    xm = this.plot_view.frame.x_mappers['default'];
    ym = this.plot_view.frame.y_mappers['default'];
    switch (g.type) {
      case 'point':
        g.x = xm.map_from_target(g.vx);
        g.y = ym.map_from_target(g.vy);
        break;
      case 'rect':
        g.x0 = xm.map_from_target(g.vx0);
        g.y0 = ym.map_from_target(g.vy0);
        g.x1 = xm.map_from_target(g.vx1);
        g.y1 = ym.map_from_target(g.vy1);
        break;
      case 'poly':
        g.x = new Array(g.vx.length);
        g.y = new Array(g.vy.length);
        for (i = j = 0, ref = g.vx.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
          g.x[i] = xm.map_from_target(g.vx[i]);
          g.y[i] = ym.map_from_target(g.vy[i]);
        }
        break;
      default:
        logger.debug("Unrecognized selection geometry type: '" + g.type + "'");
    }
    if (final) {
      tool_events = this.plot_model.plot.tool_events;
      if (append) {
        geoms = tool_events.geometries;
        geoms.push(g);
      } else {
        geoms = [g];
      }
      tool_events.geometries = geoms;
    }
    return null;
  };

  return SelectToolView;

})(GestureTool.View);

SelectTool = (function(superClass) {
  extend(SelectTool, superClass);

  function SelectTool() {
    return SelectTool.__super__.constructor.apply(this, arguments);
  }

  SelectTool.define({
    renderers: [p.Array, []],
    names: [p.Array, []]
  });

  SelectTool.internal({
    multi_select_modifier: [p.String, "shift"]
  });

  SelectTool.prototype.initialize = function(attrs, options) {
    SelectTool.__super__.initialize.call(this, attrs, options);
    this.define_computed_property('computed_renderers', function() {
      var all_renderers, names, r, renderers;
      renderers = this.renderers;
      names = this.names;
      if (renderers.length === 0) {
        all_renderers = this.plot.renderers;
        renderers = (function() {
          var j, len, results;
          results = [];
          for (j = 0, len = all_renderers.length; j < len; j++) {
            r = all_renderers[j];
            if (r instanceof GlyphRenderer.Model) {
              results.push(r);
            }
          }
          return results;
        })();
      }
      if (names.length > 0) {
        renderers = (function() {
          var j, len, results;
          results = [];
          for (j = 0, len = renderers.length; j < len; j++) {
            r = renderers[j];
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
    return this.add_dependencies('computed_renderers', this.plot, ['renderers']);
  };

  SelectTool.getters({
    computed_renderers: function() {
      return this._get_computed('computed_renderers');
    }
  });

  return SelectTool;

})(GestureTool.Model);

module.exports = {
  Model: SelectTool,
  View: SelectToolView
};
