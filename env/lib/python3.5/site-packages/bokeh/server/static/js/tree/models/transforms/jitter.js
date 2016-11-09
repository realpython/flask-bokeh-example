var Jitter, Transform, _, bokeh_math, p,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

Transform = require("./transform");

p = require("../../core/properties");

bokeh_math = require("../../core/util/math");

Jitter = (function(superClass) {
  extend(Jitter, superClass);

  function Jitter() {
    return Jitter.__super__.constructor.apply(this, arguments);
  }

  Jitter.define({
    mean: [p.Number, 0],
    width: [p.Number, 1],
    distribution: [p.Distribution, 'uniform']
  });

  Jitter.prototype.compute = function(x) {
    if (this.distribution === 'uniform') {
      return x + this.mean + ((bokeh_math.random() - 0.5) * this.width);
    }
    if (this.distribution === 'normal') {
      return x + bokeh_math.rnorm(this.mean, this.width);
    }
  };

  Jitter.prototype.v_compute = function(xs) {
    var i, idx, len, result, x;
    result = new Float64Array(xs.length);
    for (idx = i = 0, len = xs.length; i < len; idx = ++i) {
      x = xs[idx];
      result[idx] = this.compute(x);
    }
    return result;
  };

  return Jitter;

})(Transform.Model);

module.exports = {
  Model: Jitter
};
