var fixup_ellipse, fixup_image_smoothing, fixup_line_dash, fixup_line_dash_offset, fixup_measure_text, get_scale_ratio;

fixup_line_dash = function(ctx) {
  if (!ctx.setLineDash) {
    ctx.setLineDash = function(dash) {
      ctx.mozDash = dash;
      return ctx.webkitLineDash = dash;
    };
  }
  if (!ctx.getLineDash) {
    return ctx.getLineDash = function() {
      return ctx.mozDash;
    };
  }
};

fixup_line_dash_offset = function(ctx) {
  ctx.setLineDashOffset = function(dash_offset) {
    ctx.lineDashOffset = dash_offset;
    ctx.mozDashOffset = dash_offset;
    return ctx.webkitLineDashOffset = dash_offset;
  };
  return ctx.getLineDashOffset = function() {
    return ctx.mozDashOffset;
  };
};

fixup_image_smoothing = function(ctx) {
  ctx.setImageSmoothingEnabled = function(value) {
    ctx.imageSmoothingEnabled = value;
    ctx.mozImageSmoothingEnabled = value;
    ctx.oImageSmoothingEnabled = value;
    return ctx.webkitImageSmoothingEnabled = value;
  };
  return ctx.getImageSmoothingEnabled = function() {
    var ref;
    return (ref = ctx.imageSmoothingEnabled) != null ? ref : true;
  };
};

fixup_measure_text = function(ctx) {
  if (ctx.measureText && (ctx.html5MeasureText == null)) {
    ctx.html5MeasureText = ctx.measureText;
    return ctx.measureText = function(text) {
      var textMetrics;
      textMetrics = ctx.html5MeasureText(text);
      textMetrics.ascent = ctx.html5MeasureText("m").width * 1.6;
      return textMetrics;
    };
  }
};

get_scale_ratio = function(ctx, hidpi) {
  var backingStoreRatio, devicePixelRatio;
  if (hidpi) {
    devicePixelRatio = window.devicePixelRatio || 1;
    backingStoreRatio = ctx.webkitBackingStorePixelRatio || ctx.mozBackingStorePixelRatio || ctx.msBackingStorePixelRatio || ctx.oBackingStorePixelRatio || ctx.backingStorePixelRatio || 1;
    return devicePixelRatio / backingStoreRatio;
  } else {
    return 1;
  }
};

fixup_ellipse = function(ctx) {
  var ellipse_bezier;
  ellipse_bezier = function(x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise) {
    var c, rx, ry;
    if (anticlockwise == null) {
      anticlockwise = false;
    }
    c = 0.551784;
    ctx.translate(x, y);
    ctx.rotate(rotation);
    rx = radiusX;
    ry = radiusY;
    if (anticlockwise) {
      rx = -radiusX;
      ry = -radiusY;
    }
    ctx.moveTo(-rx, 0);
    ctx.bezierCurveTo(-rx, ry * c, -rx * c, ry, 0, ry);
    ctx.bezierCurveTo(rx * c, ry, rx, ry * c, rx, 0);
    ctx.bezierCurveTo(rx, -ry * c, rx * c, -ry, 0, -ry);
    ctx.bezierCurveTo(-rx * c, -ry, -rx, -ry * c, -rx, 0);
    ctx.rotate(-rotation);
    ctx.translate(-x, -y);
  };
  if (!ctx.ellipse) {
    return ctx.ellipse = ellipse_bezier;
  }
};

module.exports = {
  fixup_image_smoothing: fixup_image_smoothing,
  fixup_line_dash: fixup_line_dash,
  fixup_line_dash_offset: fixup_line_dash_offset,
  fixup_measure_text: fixup_measure_text,
  get_scale_ratio: get_scale_ratio,
  fixup_ellipse: fixup_ellipse
};
