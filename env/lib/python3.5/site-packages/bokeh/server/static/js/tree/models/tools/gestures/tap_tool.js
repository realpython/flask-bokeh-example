var SelectTool, TapTool, TapToolView, _, p,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

SelectTool = require("./select_tool");

p = require("../../../core/properties");

TapToolView = (function(superClass) {
  extend(TapToolView, superClass);

  function TapToolView() {
    return TapToolView.__super__.constructor.apply(this, arguments);
  }

  TapToolView.prototype._tap = function(e) {
    var append, canvas, ref, vx, vy;
    canvas = this.plot_view.canvas;
    vx = canvas.sx_to_vx(e.bokeh.sx);
    vy = canvas.sy_to_vy(e.bokeh.sy);
    append = (ref = e.srcEvent.shiftKey) != null ? ref : false;
    return this._select(vx, vy, true, append);
  };

  TapToolView.prototype._select = function(vx, vy, final, append) {
    var callback, cb_data, did_hit, ds, geometry, i, len, r, ref, sm, view;
    geometry = {
      type: 'point',
      vx: vx,
      vy: vy
    };
    callback = this.model.callback;
    this._save_geometry(geometry, final, append);
    cb_data = {
      geometries: this.plot_model.plot.tool_events.geometries
    };
    ref = this.model.computed_renderers;
    for (i = 0, len = ref.length; i < len; i++) {
      r = ref[i];
      ds = r.data_source;
      sm = ds.selection_manager;
      view = this.plot_view.renderer_views[r.id];
      if (this.model.behavior === "select") {
        did_hit = sm.select(this, view, geometry, final, append);
      } else {
        did_hit = sm.inspect(this, view, geometry, {
          geometry: geometry
        });
      }
      if (did_hit && (callback != null)) {
        if (_.isFunction(callback)) {
          callback(ds, cb_data);
        } else {
          callback.execute(ds, cb_data);
        }
      }
    }
    if (this.model.behavior === "select") {
      this.plot_view.push_state('tap', {
        selection: this.plot_view.get_selection()
      });
    }
    return null;
  };

  return TapToolView;

})(SelectTool.View);

TapTool = (function(superClass) {
  extend(TapTool, superClass);

  function TapTool() {
    return TapTool.__super__.constructor.apply(this, arguments);
  }

  TapTool.prototype.default_view = TapToolView;

  TapTool.prototype.type = "TapTool";

  TapTool.prototype.tool_name = "Tap";

  TapTool.prototype.icon = "bk-tool-icon-tap-select";

  TapTool.prototype.event_type = "tap";

  TapTool.prototype.default_order = 10;

  TapTool.define({
    behavior: [p.String, "select"],
    callback: [p.Any]
  });

  return TapTool;

})(SelectTool.Model);

module.exports = {
  Model: TapTool,
  View: TapToolView
};
