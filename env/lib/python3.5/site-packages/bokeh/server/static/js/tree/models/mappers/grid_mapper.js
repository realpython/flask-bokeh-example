var GridMapper, Model,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Model = require("../../model");

GridMapper = (function(superClass) {
  extend(GridMapper, superClass);

  function GridMapper() {
    return GridMapper.__super__.constructor.apply(this, arguments);
  }

  GridMapper.prototype.map_to_target = function(x, y) {
    var xprime, yprime;
    xprime = this.domain_mapper.map_to_target(x);
    yprime = this.codomain_mapper.map_to_target(y);
    return [xprime, yprime];
  };

  GridMapper.prototype.v_map_to_target = function(xs, ys) {
    var xprimes, yprimes;
    xprimes = this.domain_mapper.v_map_to_target(xs);
    yprimes = this.codomain_mapper.v_map_to_target(ys);
    return [xprimes, yprimes];
  };

  GridMapper.prototype.map_from_target = function(xprime, yprime) {
    var x, y;
    x = this.domain_mapper.map_from_target(xprime);
    y = this.codomain_mapper.map_from_target(yprime);
    return [x, y];
  };

  GridMapper.prototype.v_map_from_target = function(xprimes, yprimes) {
    var xs, ys;
    xs = this.domain_mapper.v_map_from_target(xprimes);
    ys = this.codomain_mapper.v_map_from_target(yprimes);
    return [xs, ys];
  };

  return GridMapper;

})(Model);

module.exports = {
  Model: GridMapper
};
