var Model, ToolEvents, _, logger, p,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

Model = require("../../model");

logger = require("../../core/logging").logger;

p = require("../../core/properties");

ToolEvents = (function(superClass) {
  extend(ToolEvents, superClass);

  function ToolEvents() {
    return ToolEvents.__super__.constructor.apply(this, arguments);
  }

  ToolEvents.prototype.type = 'ToolEvents';

  ToolEvents.define({
    geometries: [p.Array, []]
  });

  return ToolEvents;

})(Model);

module.exports = {
  Model: ToolEvents
};
