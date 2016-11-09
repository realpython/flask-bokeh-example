var Model, Range, _, p,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

Model = require("../../model");

p = require("../../core/properties");

Range = (function(superClass) {
  extend(Range, superClass);

  function Range() {
    return Range.__super__.constructor.apply(this, arguments);
  }

  Range.prototype.type = 'Range';

  Range.define({
    callback: [p.Instance]
  });

  Range.internal({
    plots: [p.Array, []]
  });

  Range.prototype.reset = function() {};

  return Range;

})(Model);

module.exports = {
  Model: Range
};
