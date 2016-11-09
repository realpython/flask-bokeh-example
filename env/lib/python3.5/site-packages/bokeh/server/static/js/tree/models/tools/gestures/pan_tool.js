var GestureTool, PanTool, PanToolView, _, p,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

GestureTool = require("./gesture_tool");

p = require("../../../core/properties");

PanToolView = (function(superClass) {
  extend(PanToolView, superClass);

  function PanToolView() {
    return PanToolView.__super__.constructor.apply(this, arguments);
  }

  PanToolView.prototype._pan_start = function(e) {
    var canvas, frame, hr, vr, vx, vy;
    this.last_dx = 0;
    this.last_dy = 0;
    canvas = this.plot_view.canvas;
    frame = this.plot_view.frame;
    vx = canvas.sx_to_vx(e.bokeh.sx);
    vy = canvas.sy_to_vy(e.bokeh.sy);
    if (!frame.contains(vx, vy)) {
      hr = frame.h_range;
      vr = frame.v_range;
      if (vx < hr.start || vx > hr.end) {
        this.v_axis_only = true;
      }
      if (vy < vr.start || vy > vr.end) {
        this.h_axis_only = true;
      }
    }
    return this.plot_view.interactive_timestamp = Date.now();
  };

  PanToolView.prototype._pan = function(e) {
    this._update(e.deltaX, -e.deltaY);
    return this.plot_view.interactive_timestamp = Date.now();
  };

  PanToolView.prototype._pan_end = function(e) {
    this.h_axis_only = false;
    this.v_axis_only = false;
    if (this.pan_info != null) {
      return this.plot_view.push_state('pan', {
        range: this.pan_info
      });
    }
  };

  PanToolView.prototype._update = function(dx, dy) {
    var dims, end, frame, hr, is_panning, mapper, name, new_dx, new_dy, ref, ref1, ref2, ref3, sdx, sdy, start, sx0, sx1, sx_high, sx_low, sy0, sy1, sy_high, sy_low, vr, xrs, yrs;
    frame = this.plot_view.frame;
    new_dx = dx - this.last_dx;
    new_dy = dy - this.last_dy;
    hr = frame.h_range;
    sx_low = hr.start - new_dx;
    sx_high = hr.end - new_dx;
    vr = frame.v_range;
    sy_low = vr.start - new_dy;
    sy_high = vr.end - new_dy;
    dims = this.model.dimensions;
    if ((dims === 'width' || dims === 'both') && !this.v_axis_only) {
      sx0 = sx_low;
      sx1 = sx_high;
      sdx = -new_dx;
    } else {
      sx0 = hr.start;
      sx1 = hr.end;
      sdx = 0;
    }
    if ((dims === 'height' || dims === 'both') && !this.h_axis_only) {
      sy0 = sy_low;
      sy1 = sy_high;
      sdy = new_dy;
    } else {
      sy0 = vr.start;
      sy1 = vr.end;
      sdy = 0;
    }
    this.last_dx = dx;
    this.last_dy = dy;
    xrs = {};
    ref = frame.x_mappers;
    for (name in ref) {
      mapper = ref[name];
      ref1 = mapper.v_map_from_target([sx0, sx1], true), start = ref1[0], end = ref1[1];
      xrs[name] = {
        start: start,
        end: end
      };
    }
    yrs = {};
    ref2 = frame.y_mappers;
    for (name in ref2) {
      mapper = ref2[name];
      ref3 = mapper.v_map_from_target([sy0, sy1], true), start = ref3[0], end = ref3[1];
      yrs[name] = {
        start: start,
        end: end
      };
    }
    this.pan_info = {
      xrs: xrs,
      yrs: yrs,
      sdx: sdx,
      sdy: sdy
    };
    this.plot_view.update_range(this.pan_info, is_panning = true);
    return null;
  };

  return PanToolView;

})(GestureTool.View);

PanTool = (function(superClass) {
  extend(PanTool, superClass);

  function PanTool() {
    return PanTool.__super__.constructor.apply(this, arguments);
  }

  PanTool.prototype.default_view = PanToolView;

  PanTool.prototype.type = "PanTool";

  PanTool.prototype.tool_name = "Pan";

  PanTool.prototype.icon = "bk-tool-icon-pan";

  PanTool.prototype.event_type = "pan";

  PanTool.prototype.default_order = 10;

  PanTool.define({
    dimensions: [p.Dimensions, "both"]
  });

  PanTool.getters({
    tooltip: function() {
      return this._get_dim_tooltip("Pan", this.dimensions);
    }
  });

  return PanTool;

})(GestureTool.Model);

module.exports = {
  Model: PanTool,
  View: PanToolView
};
