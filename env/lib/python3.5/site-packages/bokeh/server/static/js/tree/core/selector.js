var HasProps, Selector, _, hittest, logger, p,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

HasProps = require("./has_props");

hittest = require("./hittest");

logger = require("./logging").logger;

p = require("./properties");

Selector = (function(superClass) {
  extend(Selector, superClass);

  function Selector() {
    return Selector.__super__.constructor.apply(this, arguments);
  }

  Selector.prototype.type = 'Selector';

  Selector.prototype.update = function(indices, final, append, silent) {
    if (silent == null) {
      silent = false;
    }
    this.setv('timestamp', new Date(), {
      silent: silent
    });
    this.setv('final', final, {
      silent: silent
    });
    if (append) {
      indices['0d'].indices = _.union(this.indices['0d'].indices, indices['0d'].indices);
      indices['0d'].glyph = this.indices['0d'].glyph || indices['0d'].glyph;
      indices['1d'].indices = _.union(this.indices['1d'].indices, indices['1d'].indices);
      indices['2d'].indices = _.union(this.indices['2d'].indices, indices['2d'].indices);
    }
    return this.setv('indices', indices, {
      silent: silent
    });
  };

  Selector.prototype.clear = function() {
    this.timestamp = new Date();
    this.final = true;
    return this.indices = hittest.create_hit_test_result();
  };

  Selector.internal({
    indices: [
      p.Any, function() {
        return hittest.create_hit_test_result();
      }
    ],
    final: [p.Boolean],
    timestamp: [p.Any]
  });

  return Selector;

})(HasProps);

module.exports = Selector;
