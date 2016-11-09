var GestureTool, WheelPanTool, WheelPanToolView, _, p,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

GestureTool = require("./gesture_tool");

p = require("../../../core/properties");

WheelPanToolView = (function(superClass) {
  extend(WheelPanToolView, superClass);

  function WheelPanToolView() {
    return WheelPanToolView.__super__.constructor.apply(this, arguments);
  }

  WheelPanToolView.prototype._scroll = function(e) {
    var delta, factor, multiplier, ref;
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
    if (factor > 0.9) {
      factor = 0.9;
    } else if (factor < -0.9) {
      factor = -0.9;
    }
    return this._update_ranges(factor);
  };

  WheelPanToolView.prototype._update_ranges = function(factor) {
    var end, frame, hr, mapper, name, pan_info, ref, ref1, ref2, ref3, ref4, ref5, start, sx0, sx1, sy0, sy1, vr, vx_high, vx_low, vx_range, vy_high, vy_low, vy_range, xrs, yrs;
    frame = this.plot_model.frame;
    hr = frame.h_range;
    vr = frame.v_range;
    ref = [hr.start, hr.end], vx_low = ref[0], vx_high = ref[1];
    ref1 = [vr.start, vr.end], vy_low = ref1[0], vy_high = ref1[1];
    switch (this.model.dimension) {
      case "height":
        vy_range = Math.abs(vy_high - vy_low);
        sx0 = vx_low;
        sx1 = vx_high;
        sy0 = vy_low + vy_range * factor;
        sy1 = vy_high + vy_range * factor;
        break;
      case "width":
        vx_range = Math.abs(vx_high - vx_low);
        sx0 = vx_low - vx_range * factor;
        sx1 = vx_high - vx_range * factor;
        sy0 = vy_low;
        sy1 = vy_high;
    }
    xrs = {};
    ref2 = frame.x_mappers;
    for (name in ref2) {
      mapper = ref2[name];
      ref3 = mapper.v_map_from_target([sx0, sx1], true), start = ref3[0], end = ref3[1];
      xrs[name] = {
        start: start,
        end: end
      };
    }
    yrs = {};
    ref4 = frame.y_mappers;
    for (name in ref4) {
      mapper = ref4[name];
      ref5 = mapper.v_map_from_target([sy0, sy1], true), start = ref5[0], end = ref5[1];
      yrs[name] = {
        start: start,
        end: end
      };
    }
    pan_info = {
      xrs: xrs,
      yrs: yrs,
      factor: factor
    };
    this.plot_view.push_state('wheel_pan', {
      range: pan_info
    });
    this.plot_view.update_range(pan_info, false, true);
    this.plot_view.interactive_timestamp = Date.now();
    return null;
  };

  return WheelPanToolView;

})(GestureTool.View);

WheelPanTool = (function(superClass) {
  extend(WheelPanTool, superClass);

  function WheelPanTool() {
    return WheelPanTool.__super__.constructor.apply(this, arguments);
  }

  WheelPanTool.prototype.type = 'WheelPanTool';

  WheelPanTool.prototype.default_view = WheelPanToolView;

  WheelPanTool.prototype.tool_name = "Wheel Pan";

  WheelPanTool.prototype.icon = "bk-tool-icon-wheel-pan";

  WheelPanTool.prototype.event_type = 'scroll';

  WheelPanTool.prototype.default_order = 12;

  WheelPanTool.getters({
    tooltip: function() {
      return this._get_dim_tooltip(this.tool_name, this.dimension);
    }
  });

  WheelPanTool.define({
    dimension: [p.Dimension, "width"]
  });

  WheelPanTool.internal({
    speed: [p.Number, 1 / 1000]
  });

  return WheelPanTool;

})(GestureTool.Model);

module.exports = {
  Model: WheelPanTool,
  View: WheelPanToolView
};
