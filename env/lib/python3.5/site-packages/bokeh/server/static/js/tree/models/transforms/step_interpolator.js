var Interpolator, StepInterpolator, Transform, _, p,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

Transform = require("./transform");

Interpolator = require("./interpolator");

p = require("../../core/properties");

StepInterpolator = (function(superClass) {
  extend(StepInterpolator, superClass);

  function StepInterpolator() {
    return StepInterpolator.__super__.constructor.apply(this, arguments);
  }

  StepInterpolator.define({
    mode: [p.TransformStepMode, "after"]
  });

  StepInterpolator.prototype.compute = function(x) {
    var descending, diffs, ind, mdiff, ret, tx;
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
    ind = -1;
    if (this.mode === "after") {
      ind = _.findLastIndex(this._x_sorted, function(num) {
        return x >= num;
      });
    }
    if (this.mode === "before") {
      ind = _.findIndex(this._x_sorted, function(num) {
        return x <= num;
      });
    }
    if (this.mode === "center") {
      diffs = (function() {
        var i, len, ref, results;
        ref = this._x_sorted;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          tx = ref[i];
          results.push(Math.abs(tx - x));
        }
        return results;
      }).call(this);
      mdiff = _.min(diffs);
      ind = _.findIndex(diffs, function(num) {
        return mdiff === num;
      });
    }
    if (ind !== -1) {
      ret = this._y_sorted[ind];
    } else {
      ret = null;
    }
    return ret;
  };

  StepInterpolator.prototype.v_compute = function(xs) {
    var i, idx, len, result, x;
    result = new Float64Array(xs.length);
    for (idx = i = 0, len = xs.length; i < len; idx = ++i) {
      x = xs[idx];
      result[idx] = this.compute(x);
    }
    return result;
  };

  return StepInterpolator;

})(Interpolator.Model);

module.exports = {
  Model: StepInterpolator
};
