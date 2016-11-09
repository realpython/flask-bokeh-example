var DEFAULT_POLY_OVERLAY, PolyAnnotation, PolySelectTool, PolySelectToolView, SelectTool, _, p,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

SelectTool = require("./select_tool");

PolyAnnotation = require("../../annotations/poly_annotation");

p = require("../../../core/properties");

PolySelectToolView = (function(superClass) {
  extend(PolySelectToolView, superClass);

  function PolySelectToolView() {
    return PolySelectToolView.__super__.constructor.apply(this, arguments);
  }

  PolySelectToolView.prototype.initialize = function(options) {
    PolySelectToolView.__super__.initialize.call(this, options);
    this.listenTo(this.model, 'change:active', this._active_change);
    return this.data = null;
  };

  PolySelectToolView.prototype._active_change = function() {
    if (!this.model.active) {
      return this._clear_data();
    }
  };

  PolySelectToolView.prototype._keyup = function(e) {
    if (e.keyCode === 13) {
      return this._clear_data();
    }
  };

  PolySelectToolView.prototype._doubletap = function(e) {
    var append, ref;
    append = (ref = e.srcEvent.shiftKey) != null ? ref : false;
    this._select(this.data.vx, this.data.vy, true, append);
    return this._clear_data();
  };

  PolySelectToolView.prototype._clear_data = function() {
    this.data = null;
    return this.model.overlay.update({
      xs: [],
      ys: []
    });
  };

  PolySelectToolView.prototype._tap = function(e) {
    var canvas, new_data, overlay, vx, vy;
    canvas = this.plot_view.canvas;
    vx = canvas.sx_to_vx(e.bokeh.sx);
    vy = canvas.sy_to_vy(e.bokeh.sy);
    if (this.data == null) {
      this.data = {
        vx: [vx],
        vy: [vy]
      };
      return null;
    }
    this.data.vx.push(vx);
    this.data.vy.push(vy);
    overlay = this.model.overlay;
    new_data = {};
    new_data.vx = _.clone(this.data.vx);
    new_data.vy = _.clone(this.data.vy);
    return overlay.update({
      xs: this.data.vx,
      ys: this.data.vy
    });
  };

  PolySelectToolView.prototype._select = function(vx, vy, final, append) {
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
    this._save_geometry(geometry, final, append);
    this.plot_view.push_state('poly_select', {
      selection: this.plot_view.get_selection()
    });
    return null;
  };

  return PolySelectToolView;

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

PolySelectTool = (function(superClass) {
  extend(PolySelectTool, superClass);

  function PolySelectTool() {
    return PolySelectTool.__super__.constructor.apply(this, arguments);
  }

  PolySelectTool.prototype.default_view = PolySelectToolView;

  PolySelectTool.prototype.type = "PolySelectTool";

  PolySelectTool.prototype.tool_name = "Poly Select";

  PolySelectTool.prototype.icon = "bk-tool-icon-polygon-select";

  PolySelectTool.prototype.event_type = "tap";

  PolySelectTool.prototype.default_order = 11;

  PolySelectTool.define({
    overlay: [p.Instance, DEFAULT_POLY_OVERLAY]
  });

  return PolySelectTool;

})(SelectTool.Model);

module.exports = {
  Model: PolySelectTool,
  View: PolySelectToolView
};
