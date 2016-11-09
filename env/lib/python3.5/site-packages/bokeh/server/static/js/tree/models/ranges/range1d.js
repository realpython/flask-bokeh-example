var Range, Range1d, _, p,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

Range = require("./range");

p = require("../../core/properties");

Range1d = (function(superClass) {
  extend(Range1d, superClass);

  Range1d.prototype.type = 'Range1d';

  Range1d.define({
    start: [p.Number, 0],
    end: [p.Number, 1],
    bounds: [p.Any],
    min_interval: [p.Any],
    max_interval: [p.Any]
  });

  Range1d.prototype._set_auto_bounds = function() {
    var max, min;
    if (this.bounds === 'auto') {
      min = Math.min(this._initial_start, this._initial_end);
      max = Math.max(this._initial_start, this._initial_end);
      return this.bounds = [min, max];
    }
  };

  function Range1d() {
    var end, start;
    if (this instanceof Range1d) {
      return Range1d.__super__.constructor.apply(this, arguments);
    } else {
      start = arguments[0], end = arguments[1];
      return new Range1d({
        start: start,
        end: end
      });
    }
  }

  Range1d.prototype.initialize = function(attrs, options) {
    Range1d.__super__.initialize.call(this, attrs, options);
    this._initial_start = this.start;
    this._initial_end = this.end;
    return this._set_auto_bounds();
  };

  Range1d.getters({
    min: function() {
      return Math.min(this.start, this.end);
    },
    max: function() {
      return Math.max(this.start, this.end);
    }
  });

  Range1d.prototype.reset = function() {
    this.setv({
      start: this._initial_start,
      end: this._initial_end
    });
    return this._set_auto_bounds();
  };

  return Range1d;

})(Range.Model);

module.exports = {
  Model: Range1d
};
