var GestureTool, WheelZoomTool, WheelZoomToolView, _, document, p, scale_range,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

GestureTool = require("./gesture_tool");

scale_range = require("../../../core/util/zoom").scale_range;

p = require("../../../core/properties");

if (typeof document === "undefined" || document === null) {
  document = {};
}

WheelZoomToolView = (function(superClass) {
  extend(WheelZoomToolView, superClass);

  function WheelZoomToolView() {
    return WheelZoomToolView.__super__.constructor.apply(this, arguments);
  }

  WheelZoomToolView.prototype._pinch = function(e) {
    var delta;
    if (e.scale >= 1) {
      delta = (e.scale - 1) * 20.0;
    } else {
      delta = -20.0 / e.scale;
    }
    e.bokeh.delta = delta;
    return this._scroll(e);
  };

  WheelZoomToolView.prototype._scroll = function(e) {
    var delta, dims, factor, frame, h_axis, hr, multiplier, ref, v_axis, vr, vx, vy, zoom_info;
    frame = this.plot_model.frame;
    hr = frame.h_range;
    vr = frame.v_range;
    vx = this.plot_view.canvas.sx_to_vx(e.bokeh.sx);
    vy = this.plot_view.canvas.sy_to_vy(e.bokeh.sy);
    dims = this.model.dimensions;
    h_axis = (dims === 'width' || dims === 'both') && (hr.min < vx && vx < hr.max);
    v_axis = (dims === 'height' || dims === 'both') && (vr.min < vy && vy < vr.max);
    if (navigator.userAgent.toLowerCase().indexOf("firefox") > -1) {
      multiplier = 20;
    } else {
      multiplier = 1;
    }
    if (((ref = e.originalEvent) != null ? ref.deltaY : void 0) != null) {
      delta = -e.originalEvent.deltaY * multiplier;
    } else {
      delta = e.bokeh.delta;
    }
    factor = this.model.speed * delta;
    zoom_info = scale_range(frame, factor, h_axis, v_axis, {
      x: vx,
      y: vy
    });
    this.plot_view.push_state('wheel_zoom', {
      range: zoom_info
    });
    this.plot_view.update_range(zoom_info, false, true);
    this.plot_view.interactive_timestamp = Date.now();
    return null;
  };

  return WheelZoomToolView;

})(GestureTool.View);

WheelZoomTool = (function(superClass) {
  extend(WheelZoomTool, superClass);

  function WheelZoomTool() {
    return WheelZoomTool.__super__.constructor.apply(this, arguments);
  }

  WheelZoomTool.prototype.default_view = WheelZoomToolView;

  WheelZoomTool.prototype.type = "WheelZoomTool";

  WheelZoomTool.prototype.tool_name = "Wheel Zoom";

  WheelZoomTool.prototype.icon = "bk-tool-icon-wheel-zoom";

  WheelZoomTool.prototype.event_type = 'ontouchstart' in window || navigator.maxTouchPoints > 0 ? 'pinch' : 'scroll';

  WheelZoomTool.prototype.default_order = 10;

  WheelZoomTool.getters({
    tooltip: function() {
      return this._get_dim_tooltip(this.tool_name, this.dimensions);
    }
  });

  WheelZoomTool.define({
    dimensions: [p.Dimensions, "both"]
  });

  WheelZoomTool.internal({
    speed: [p.Number, 1 / 600]
  });

  return WheelZoomTool;

})(GestureTool.Model);

module.exports = {
  Model: WheelZoomTool,
  View: WheelZoomToolView
};
