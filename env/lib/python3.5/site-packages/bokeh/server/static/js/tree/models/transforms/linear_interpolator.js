var Interpolator, LinearInterpolator, Transform, _,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

Transform = require("./transform");

Interpolator = require("./interpolator");

LinearInterpolator = (function(superClass) {
  extend(LinearInterpolator, superClass);

  function LinearInterpolator() {
    return LinearInterpolator.__super__.constructor.apply(this, arguments);
  }

  LinearInterpolator.prototype.compute = function(x) {
    var descending, ind, ret, x1, x2, y1, y2;
    this.sort(descending = false);
    if (this.clip === true) {
      if (x < this._x_sorted[0] || x > this._x_sorted[this._x_sorted.length - 1]) {
        return null;
      }
    } else {
      if (x < this._x_sorted[0]) {
        return this._y_sorted[0];
      }
      if (x > this._x_sorted[this._x_sorted.length - 1]) {
        return this._y_sorted[this._y_sorted.length - 1];
      }
    }
    ind = _.findLastIndex(this._x_sorted, function(num) {
      return x >= num;
    });
    x1 = this._x_sorted[ind];
    x2 = this._x_sorted[ind + 1];
    y1 = this._y_sorted[ind];
    y2 = this._y_sorted[ind + 1];
    ret = y1 + (((x - x1) / (x2 - x1)) * (y2 - y1));
    return ret;
  };

  LinearInterpolator.prototype.v_compute = function(xs) {
    var i, idx, len, result, x;
    result = new Float64Array(xs.length);
    for (idx = i = 0, len = xs.length; i < len; idx = ++i) {
      x = xs[idx];
      result[idx] = this.compute(x);
    }
    return result;
  };

  return LinearInterpolator;

})(Interpolator.Model);

module.exports = {
  Model: LinearInterpolator
};
