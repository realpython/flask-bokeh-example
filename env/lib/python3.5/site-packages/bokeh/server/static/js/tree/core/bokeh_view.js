var Backbone, BokehView, _,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

Backbone = require("./backbone");

BokehView = (function(superClass) {
  extend(BokehView, superClass);

  function BokehView() {
    return BokehView.__super__.constructor.apply(this, arguments);
  }

  BokehView.prototype.initialize = function(options) {
    if (!_.has(options, 'id')) {
      return this.id = _.uniqueId('BokehView');
    }
  };

  BokehView.prototype.toString = function() {
    return this.model.type + ".View(" + this.id + ")";
  };

  BokehView.prototype.bind_bokeh_events = function() {};

  BokehView.prototype.remove = function() {
    var ref, target, val;
    if (_.has(this, 'eventers')) {
      ref = this.eventers;
      for (target in ref) {
        if (!hasProp.call(ref, target)) continue;
        val = ref[target];
        val.off(null, null, this);
      }
    }
    this.trigger('remove', this);
    return BokehView.__super__.remove.call(this);
  };

  return BokehView;

})(Backbone.View);

module.exports = BokehView;
