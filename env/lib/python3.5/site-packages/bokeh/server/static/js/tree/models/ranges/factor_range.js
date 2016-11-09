var FactorRange, Range, _, p,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

Range = require("./range");

p = require("../../core/properties");

FactorRange = (function(superClass) {
  extend(FactorRange, superClass);

  function FactorRange() {
    return FactorRange.__super__.constructor.apply(this, arguments);
  }

  FactorRange.prototype.type = 'FactorRange';

  FactorRange.define({
    offset: [p.Number, 0],
    factors: [p.Array, []],
    bounds: [p.Any],
    min_interval: [p.Any],
    max_interval: [p.Any]
  });

  FactorRange.internal({
    _bounds_as_factors: [p.Any],
    start: [p.Number],
    end: [p.Number]
  });

  FactorRange.prototype.initialize = function(attrs, options) {
    FactorRange.__super__.initialize.call(this, attrs, options);
    if ((this.bounds != null) && this.bounds !== 'auto') {
      this._bounds_as_factors = this.bounds;
    } else {
      this._bounds_as_factors = this.factors;
    }
    this._init();
    this.listenTo(this, 'change:factors', this._update_factors);
    return this.listenTo(this, 'change:offset', this._init);
  };

  FactorRange.getters({
    min: function() {
      return this.start;
    },
    max: function() {
      return this.end;
    }
  });

  FactorRange.prototype.reset = function() {
    return this._init();
  };

  FactorRange.prototype._update_factors = function() {
    this._bounds_as_factors = this.factors;
    return this._init();
  };

  FactorRange.prototype._init = function() {
    var end, factors, start;
    factors = this.factors;
    if ((this.bounds != null) && this.bounds !== 'auto') {
      factors = this._bounds_as_factors;
      this.factors = factors;
    }
    start = 0.5 + this.offset;
    end = factors.length + start;
    this.start = start;
    this.end = end;
    if (this.bounds != null) {
      return this.bounds = [start, end];
    }
  };

  return FactorRange;

})(Range.Model);

module.exports = {
  Model: FactorRange
};
