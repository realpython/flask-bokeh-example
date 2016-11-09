var BoxAnnotation, BoxSelectTool, BoxSelectToolView, DEFAULT_BOX_OVERLAY, SelectTool, _, p,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

SelectTool = require("./select_tool");

BoxAnnotation = require("../../annotations/box_annotation");

p = require("../../../core/properties");

BoxSelectToolView = (function(superClass) {
  extend(BoxSelectToolView, superClass);

  function BoxSelectToolView() {
    return BoxSelectToolView.__super__.constructor.apply(this, arguments);
  }

  BoxSelectToolView.prototype._pan_start = function(e) {
    var canvas;
    canvas = this.plot_view.canvas;
    this._baseboint = [canvas.sx_to_vx(e.bokeh.sx), canvas.sy_to_vy(e.bokeh.sy)];
    return null;
  };

  BoxSelectToolView.prototype._pan = function(e) {
    var append, canvas, curpoint, dims, frame, ref, ref1, vxlim, vylim;
    canvas = this.plot_view.canvas;
    curpoint = [canvas.sx_to_vx(e.bokeh.sx), canvas.sy_to_vy(e.bokeh.sy)];
    frame = this.plot_model.frame;
    dims = this.model.dimensions;
    ref = this.model._get_dim_limits(this._baseboint, curpoint, frame, dims), vxlim = ref[0], vylim = ref[1];
    this.model.overlay.update({
      left: vxlim[0],
      right: vxlim[1],
      top: vylim[1],
      bottom: vylim[0]
    });
    if (this.model.select_every_mousemove) {
      append = (ref1 = e.srcEvent.shiftKey) != null ? ref1 : false;
      this._select(vxlim, vylim, false, append);
    }
    return null;
  };

  BoxSelectToolView.prototype._pan_end = function(e) {
    var append, canvas, curpoint, dims, frame, ref, ref1, vxlim, vylim;
    canvas = this.plot_view.canvas;
    curpoint = [canvas.sx_to_vx(e.bokeh.sx), canvas.sy_to_vy(e.bokeh.sy)];
    frame = this.plot_model.frame;
    dims = this.model.dimensions;
    ref = this.model._get_dim_limits(this._baseboint, curpoint, frame, dims), vxlim = ref[0], vylim = ref[1];
    append = (ref1 = e.srcEvent.shiftKey) != null ? ref1 : false;
    this._select(vxlim, vylim, true, append);
    this.model.overlay.update({
      left: null,
      right: null,
      top: null,
      bottom: null
    });
    this._baseboint = null;
    this.plot_view.push_state('box_select', {
      selection: this.plot_view.get_selection()
    });
    return null;
  };

  BoxSelectToolView.prototype._select = function(arg, arg1, final, append) {
    var ds, geometry, i, len, r, ref, sm, vx0, vx1, vy0, vy1;
    vx0 = arg[0], vx1 = arg[1];
    vy0 = arg1[0], vy1 = arg1[1];
    if (append == null) {
      append = false;
    }
    geometry = {
      type: 'rect',
      vx0: vx0,
      vx1: vx1,
      vy0: vy0,
      vy1: vy1
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

  BoxSelectToolView.prototype._emit_callback = function(geometry) {
    var canvas, frame, r, xmapper, ymapper;
    r = this.model.computed_renderers[0];
    canvas = this.plot_model.canvas;
    frame = this.plot_model.frame;
    geometry['sx0'] = canvas.vx_to_sx(geometry.vx0);
    geometry['sx1'] = canvas.vx_to_sx(geometry.vx1);
    geometry['sy0'] = canvas.vy_to_sy(geometry.vy0);
    geometry['sy1'] = canvas.vy_to_sy(geometry.vy1);
    xmapper = frame.x_mappers[r.x_range_name];
    ymapper = frame.y_mappers[r.y_range_name];
    geometry['x0'] = xmapper.map_from_target(geometry.vx0);
    geometry['x1'] = xmapper.map_from_target(geometry.vx1);
    geometry['y0'] = ymapper.map_from_target(geometry.vy0);
    geometry['y1'] = ymapper.map_from_target(geometry.vy1);
    this.model.callback.execute(this.model, {
      geometry: geometry
    });
  };

  return BoxSelectToolView;

})(SelectTool.View);

DEFAULT_BOX_OVERLAY = function() {
  return new BoxAnnotation.Model({
    level: "overlay",
    render_mode: "css",
    top_units: "screen",
    left_units: "screen",
    bottom_units: "screen",
    right_units: "screen",
    fill_color: "lightgrey",
    fill_alpha: 0.5,
    line_color: "black",
    line_alpha: 1.0,
    line_width: 2,
    line_dash: [4, 4]
  });
};

BoxSelectTool = (function(superClass) {
  extend(BoxSelectTool, superClass);

  function BoxSelectTool() {
    return BoxSelectTool.__super__.constructor.apply(this, arguments);
  }

  BoxSelectTool.prototype.default_view = BoxSelectToolView;

  BoxSelectTool.prototype.type = "BoxSelectTool";

  BoxSelectTool.prototype.tool_name = "Box Select";

  BoxSelectTool.prototype.icon = "bk-tool-icon-box-select";

  BoxSelectTool.prototype.event_type = "pan";

  BoxSelectTool.prototype.default_order = 30;

  BoxSelectTool.define({
    dimensions: [p.Dimensions, "both"],
    select_every_mousemove: [p.Bool, false],
    callback: [p.Instance],
    overlay: [p.Instance, DEFAULT_BOX_OVERLAY]
  });

  BoxSelectTool.getters({
    tooltip: function() {
      return this._get_dim_tooltip(this.tool_name, this.dimensions);
    }
  });

  return BoxSelectTool;

})(SelectTool.Model);

module.exports = {
  Model: BoxSelectTool,
  View: BoxSelectToolView
};
