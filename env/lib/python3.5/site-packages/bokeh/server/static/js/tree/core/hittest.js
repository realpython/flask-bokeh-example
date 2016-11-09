var HitTestResult, check_2_segments_intersect, create_hit_test_result, dist_2_pts, dist_to_segment, dist_to_segment_squared, nullreturner, point_in_poly, sqr, validate_bbox_coords;

point_in_poly = function(x, y, px, py) {
  var i, inside, j, ref, x1, x2, y1, y2;
  inside = false;
  x1 = px[px.length - 1];
  y1 = py[py.length - 1];
  for (i = j = 0, ref = px.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
    x2 = px[i];
    y2 = py[i];
    if ((y1 < y) !== (y2 < y)) {
      if (x1 + (y - y1) / (y2 - y1) * (x2 - x1) < x) {
        inside = !inside;
      }
    }
    x1 = x2;
    y1 = y2;
  }
  return inside;
};

nullreturner = function() {
  return null;
};

HitTestResult = (function() {
  function HitTestResult() {
    this['0d'] = {
      glyph: null,
      get_view: nullreturner,
      indices: []
    };
    this['1d'] = {
      indices: []
    };
    this['2d'] = {};
  }

  Object.defineProperty(HitTestResult.prototype, '_0d', {
    get: function() {
      return this['0d'];
    }
  });

  Object.defineProperty(HitTestResult.prototype, '_1d', {
    get: function() {
      return this['1d'];
    }
  });

  Object.defineProperty(HitTestResult.prototype, '_2d', {
    get: function() {
      return this['2d'];
    }
  });

  HitTestResult.prototype.is_empty = function() {
    return this._0d.indices.length === 0 && this._1d.indices.length === 0;
  };

  return HitTestResult;

})();

create_hit_test_result = function() {
  return new HitTestResult();
};

validate_bbox_coords = function(arg, arg1) {
  var ref, ref1, x0, x1, y0, y1;
  x0 = arg[0], x1 = arg[1];
  y0 = arg1[0], y1 = arg1[1];
  if (x0 > x1) {
    ref = [x1, x0], x0 = ref[0], x1 = ref[1];
  }
  if (y0 > y1) {
    ref1 = [y1, y0], y0 = ref1[0], y1 = ref1[1];
  }
  return {
    minX: x0,
    minY: y0,
    maxX: x1,
    maxY: y1
  };
};

sqr = function(x) {
  return x * x;
};

dist_2_pts = function(vx, vy, wx, wy) {
  return sqr(vx - wx) + sqr(vy - wy);
};

dist_to_segment_squared = function(p, v, w) {
  var l2, t;
  l2 = dist_2_pts(v.x, v.y, w.x, w.y);
  if (l2 === 0) {
    return dist_2_pts(p.x, p.y, v.x, v.y);
  }
  t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  if (t < 0) {
    return dist_2_pts(p.x, p.y, v.x, v.y);
  }
  if (t > 1) {
    return dist_2_pts(p.x, p.y, w.x, w.y);
  }
  return dist_2_pts(p.x, p.y, v.x + t * (w.x - v.x), v.y + t * (w.y - v.y));
};

dist_to_segment = function(p, v, w) {
  return Math.sqrt(dist_to_segment_squared(p, v, w));
};

check_2_segments_intersect = function(l0_x0, l0_y0, l0_x1, l0_y1, l1_x0, l1_y0, l1_x1, l1_y1) {

  /* Check if 2 segments (l0 and l1) intersect. Returns a structure with
    the following attributes:
      * hit (boolean): whether the 2 segments intersect
      * x (float): x coordinate of the intersection point
      * y (float): y coordinate of the intersection point
   */
  var a, b, den, num1, num2, x, y;
  den = ((l1_y1 - l1_y0) * (l0_x1 - l0_x0)) - ((l1_x1 - l1_x0) * (l0_y1 - l0_y0));
  if (den === 0) {
    return {
      hit: false,
      x: null,
      y: null
    };
  } else {
    a = l0_y0 - l1_y0;
    b = l0_x0 - l1_x0;
    num1 = ((l1_x1 - l1_x0) * a) - ((l1_y1 - l1_y0) * b);
    num2 = ((l0_x1 - l0_x0) * a) - ((l0_y1 - l0_y0) * b);
    a = num1 / den;
    b = num2 / den;
    x = l0_x0 + (a * (l0_x1 - l0_x0));
    y = l0_y0 + (a * (l0_y1 - l0_y0));
    return {
      hit: (a > 0 && a < 1) && (b > 0 && b < 1),
      x: x,
      y: y
    };
  }
};

module.exports = {
  point_in_poly: point_in_poly,
  HitTestResult: HitTestResult,
  create_hit_test_result: create_hit_test_result,
  dist_2_pts: dist_2_pts,
  dist_to_segment: dist_to_segment,
  check_2_segments_intersect: check_2_segments_intersect,
  validate_bbox_coords: validate_bbox_coords
};
