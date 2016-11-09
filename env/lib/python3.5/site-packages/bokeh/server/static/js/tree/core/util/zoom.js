var scale_range;

scale_range = function(frame, factor, h_axis, v_axis, center) {
  var end, hr, mapper, name, ref, ref1, ref2, ref3, ref4, ref5, start, sx0, sx1, sy0, sy1, vr, vx, vx_high, vx_low, vy, vy_high, vy_low, xrs, yrs, zoom_info;
  if (h_axis == null) {
    h_axis = true;
  }
  if (v_axis == null) {
    v_axis = true;
  }
  if (center == null) {
    center = null;
  }
  "Utility function for zoom tools to calculate/create the zoom_info object\nof the form required by ``PlotCanvasView.update_range``\n\nParameters:\n  frame : CartesianFrame\n  factor : Number\n  center : object, optional\n    of form {'x': Number, 'y', Number}\n  h_axis : Boolean, optional\n    whether to zoom the horizontal axis (default = true)\n  v_axis : Boolean, optional\n    whether to zoom the horizontal axis (default = true)\n\nReturns:\n  object:";
  hr = frame.h_range;
  vr = frame.v_range;
  if (factor > 0.9) {
    factor = 0.9;
  } else if (factor < -0.9) {
    factor = -0.9;
  }
  ref = [hr.start, hr.end], vx_low = ref[0], vx_high = ref[1];
  ref1 = [vr.start, vr.end], vy_low = ref1[0], vy_high = ref1[1];
  vx = center != null ? center.x : (vx_high + vx_low) / 2.0;
  vy = center != null ? center.y : (vy_high + vy_low) / 2.0;
  if (h_axis) {
    sx0 = vx_low - (vx_low - vx) * factor;
    sx1 = vx_high - (vx_high - vx) * factor;
  } else {
    sx0 = vx_low;
    sx1 = vx_high;
  }
  if (v_axis) {
    sy0 = vy_low - (vy_low - vy) * factor;
    sy1 = vy_high - (vy_high - vy) * factor;
  } else {
    sy0 = vy_low;
    sy1 = vy_high;
  }
  xrs = {};
  ref2 = frame.x_mappers;
  for (name in ref2) {
    mapper = ref2[name];
    ref3 = mapper.v_map_from_target([sx0, sx1]), start = ref3[0], end = ref3[1];
    xrs[name] = {
      start: start,
      end: end
    };
  }
  yrs = {};
  ref4 = frame.y_mappers;
  for (name in ref4) {
    mapper = ref4[name];
    ref5 = mapper.v_map_from_target([sy0, sy1]), start = ref5[0], end = ref5[1];
    yrs[name] = {
      start: start,
      end: end
    };
  }
  zoom_info = {
    xrs: xrs,
    yrs: yrs,
    factor: factor
  };
  return zoom_info;
};

module.exports = {
  scale_range: scale_range
};
