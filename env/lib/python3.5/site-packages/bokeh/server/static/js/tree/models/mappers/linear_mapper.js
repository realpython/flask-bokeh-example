var LinearMapper, Model, p,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Model = require("../../model");

p = require("../../core/properties");

LinearMapper = (function(superClass) {
  extend(LinearMapper, superClass);

  function LinearMapper() {
    return LinearMapper.__super__.constructor.apply(this, arguments);
  }

  LinearMapper.prototype.initialize = function(attrs, options) {
    LinearMapper.__super__.initialize.call(this, attrs, options);
    this.define_computed_property('mapper_state', this._mapper_state, true);
    this.add_dependencies('mapper_state', this, ['source_range', 'target_range']);
    this.add_dependencies('mapper_state', this.source_range, ['start', 'end']);
    return this.add_dependencies('mapper_state', this.target_range, ['start', 'end']);
  };

  LinearMapper.getters({
    mapper_state: function() {
      return this._get_computed('mapper_state');
    }
  });

  LinearMapper.prototype.map_to_target = function(x) {
    var offset, ref, scale;
    ref = this.mapper_state, scale = ref[0], offset = ref[1];
    return scale * x + offset;
  };

  LinearMapper.prototype.v_map_to_target = function(xs) {
    var i, idx, len, offset, ref, result, scale, x;
    ref = this.mapper_state, scale = ref[0], offset = ref[1];
    result = new Float64Array(xs.length);
    for (idx = i = 0, len = xs.length; i < len; idx = ++i) {
      x = xs[idx];
      result[idx] = scale * x + offset;
    }
    return result;
  };

  LinearMapper.prototype.map_from_target = function(xprime) {
    var offset, ref, scale;
    ref = this.mapper_state, scale = ref[0], offset = ref[1];
    return (xprime - offset) / scale;
  };

  LinearMapper.prototype.v_map_from_target = function(xprimes) {
    var i, idx, len, offset, ref, result, scale, xprime;
    ref = this.mapper_state, scale = ref[0], offset = ref[1];
    result = new Float64Array(xprimes.length);
    for (idx = i = 0, len = xprimes.length; i < len; idx = ++i) {
      xprime = xprimes[idx];
      result[idx] = (xprime - offset) / scale;
    }
    return result;
  };

  LinearMapper.prototype._mapper_state = function() {
    var offset, scale, source_end, source_start, target_end, target_start;
    source_start = this.source_range.start;
    source_end = this.source_range.end;
    target_start = this.target_range.start;
    target_end = this.target_range.end;
    scale = (target_end - target_start) / (source_end - source_start);
    offset = -(scale * source_start) + target_start;
    return [scale, offset];
  };

  LinearMapper.internal({
    source_range: [p.Any],
    target_range: [p.Any]
  });

  return LinearMapper;

})(Model);

module.exports = {
  Model: LinearMapper
};
