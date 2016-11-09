var HasProps, Model, _, p,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

HasProps = require("./core/has_props");

p = require("./core/properties");

Model = (function(superClass) {
  extend(Model, superClass);

  function Model() {
    return Model.__super__.constructor.apply(this, arguments);
  }

  Model.prototype.type = "Model";

  Model.define({
    tags: [p.Array, []],
    name: [p.String]
  });

  Model.prototype.select = function(selector) {
    if (selector.prototype instanceof Model) {
      return this.references().filter(function(ref) {
        return ref instanceof selector;
      });
    } else if (_.isString(selector)) {
      return this.references().filter(function(ref) {
        return ref.name === selector;
      });
    } else {
      throw new Error("invalid selector");
    }
  };

  Model.prototype.select_one = function(selector) {
    var result;
    result = this.select(selector);
    switch (result.length) {
      case 0:
        return null;
      case 1:
        return result[0];
      default:
        throw new Error("found more than one object matching given selector");
    }
  };

  return Model;

})(HasProps);

module.exports = Model;
