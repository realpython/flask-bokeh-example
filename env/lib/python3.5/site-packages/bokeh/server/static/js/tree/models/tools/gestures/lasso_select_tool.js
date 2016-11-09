var DEFAULT_POLY_OVERLAY, LassoSelectTool, LassoSelectToolView, PolyAnnotation, SelectTool, _, p,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

SelectTool = require("./select_tool");

PolyAnnotation = require("../../annotations/poly_annotation");

p = require("../../../core/properties");

LassoSelectToolView = (function(superClass) {
  extend(LassoSelectToolView, superClass);

  function LassoSelectToolView() {
    return LassoSelectToolView.__super__.constructor.apply(this, arguments);
  }

  LassoSelectToolView.prototype.initialize = function(options) {
    LassoSelectToolView.__super__.initialize.call(this, options);
    this.listenTo(this.model, 'change:active', this._active_change);
    return this.data = null;
  };

  LassoSelectToolView.prototype._active_change = function() {
    if (!this.model.active) {
      return this._clear_overlay();
    }
  };

  LassoSelectToolView.prototype._keyup = function(e) {
    if (e.keyCode === 13) {
      return this._clear_overlay();
    }
  };

  LassoSelectToolView.prototype._pan_start = function(e) {
    var canvas, vx, vy;
    canvas = this.plot_view.canvas;
    vx = canvas.sx_to_vx(e.bokeh.sx);
    vy = canvas.sy_to_vy(e.bokeh.sy);
    this.data = {
      vx: [vx],
      vy: [vy]
    };
    return null;
  };

  LassoSelectToolView.prototype._pan = function(e) {
    var append, canvas, h_range, overlay, ref, v_range, vx, vy;
    canvas = this.plot_view.canvas;
    vx = canvas.sx_to_vx(e.bokeh.sx);
    vy = canvas.sy_to_vy(e.bokeh.sy);
    h_range = this.plot_model.frame.h_range;
    v_range = this.plot_model.frame.v_range;
    if (vx > h_range.end) {
      vx = h_range.end;
    }
    if (vx < h_range.start) {
      vx = h_range.start;
    }
    if (vy > v_range.end) {
      vy = v_range.end;
    }
    if (vy < v_range.start) {
      vy = v_range.start;
    }
    this.data.vx.push(vx);
    this.data.vy.push(vy);
    overlay = this.model.overlay;
    overlay.update({
      xs: this.data.vx,
      ys: this.data.vy
    });
    if (this.model.select_every_mousemove) {
      append = (ref = e.srcEvent.shiftKey) != null ? ref : false;
      return this._select(this.data.vx, this.data.vy, false, append);
    }
  };

  LassoSelectToolView.prototype._pan_end = function(e) {
    var append, ref;
    this._clear_overlay();
    append = (ref = e.srcEvent.shiftKey) != null ? ref : false;
    this._select(this.data.vx, this.data.vy, true, append);
    return this.plot_view.push_state('lasso_select', {
      selection: this.plot_view.get_selection()
    });
  };

  LassoSelectToolView.prototype._clear_overlay = function() {
    return this.model.overlay.update({
      xs: [],
      ys: []
    });
  };

  LassoSelectToolView.prototype._select = function(vx, vy, final, append) {
    var ds, geometry, i, len, r, ref, sm;
    geometry = {
      type: 'poly',
      vx: vx,
      vy: vy
    };
    ref = this.model.computed_renderers;
    for (i = 0, len = ref.length; i < len; i++) {
      r = ref[i];
      ds = r.data_source;
      sm = ds.selection_manager;
      sm.select(this, this.plot_view.renderer_views[r.id], geometry, final, append);
    }
    if (this.model.callback != null) {
      this._emit_callback(geometry);
    }
    this._save_geometry(geometry, final, append);
    return null;
  };

  LassoSelectToolView.prototype._emit_callback = function(geometry) {
    var canvas, frame, r, xmapper, ymapper;
    r = this.model.computed_renderers[0];
    canvas = this.plot_model.canvas;
    frame = this.plot_model.frame;
    geometry['sx'] = canvas.v_vx_to_sx(geometry.vx);
    geometry['sy'] = canvas.v_vy_to_sy(geometry.vy);
    xmapper = frame.x_mappers[r.x_range_name];
    ymapper = frame.y_mappers[r.y_range_name];
    geometry['x'] = xmapper.v_map_from_target(geometry.vx);
    geometry['y'] = ymapper.v_map_from_target(geometry.vy);
    this.model.callback.execute(this.model, {
      geometry: geometry
    });
  };

  return LassoSelectToolView;

})(SelectTool.View);

DEFAULT_POLY_OVERLAY = function() {
  return new PolyAnnotation.Model({
    level: "overlay",
    xs_units: "screen",
    ys_units: "screen",
    fill_color: "lightgrey",
    fill_alpha: 0.5,
    line_color: "black",
    line_alpha: 1.0,
    line_width: 2,
    line_dash: [4, 4]
  });
};

LassoSelectTool = (function(superClass) {
  extend(LassoSelectTool, superClass);

  function LassoSelectTool() {
    return LassoSelectTool.__super__.constructor.apply(this, arguments);
  }

  LassoSelectTool.prototype.default_view = LassoSelectToolView;

  LassoSelectTool.prototype.type = "LassoSelectTool";

  LassoSelectTool.prototype.tool_name = "Lasso Select";

  LassoSelectTool.prototype.icon = "bk-tool-icon-lasso-select";

  LassoSelectTool.prototype.event_type = "pan";

  LassoSelectTool.prototype.default_order = 12;

  LassoSelectTool.define({
    select_every_mousemove: [p.Bool, true],
    callback: [p.Instance],
    overlay: [p.Instance, DEFAULT_POLY_OVERLAY]
  });

  return LassoSelectTool;

})(SelectTool.Model);

module.exports = {
  Model: LassoSelectTool,
  View: LassoSelectToolView
};
