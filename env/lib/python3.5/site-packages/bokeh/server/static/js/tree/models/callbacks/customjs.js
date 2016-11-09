var CustomJS, Model, _, p,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  slice = [].slice;

_ = require("underscore");

p = require("../../core/properties");

Model = require("../../model");

CustomJS = (function(superClass) {
  extend(CustomJS, superClass);

  function CustomJS() {
    return CustomJS.__super__.constructor.apply(this, arguments);
  }

  CustomJS.prototype.type = 'CustomJS';

  CustomJS.define({
    args: [p.Any, {}],
    code: [p.String, '']
  });

  CustomJS.getters({
    values: function() {
      return this._make_values();
    },
    func: function() {
      return this._make_func();
    }
  });

  CustomJS.prototype.execute = function(cb_obj, cb_data) {
    return this.func.apply(this, slice.call(this.values).concat([cb_obj], [cb_data], [require]));
  };

  CustomJS.prototype._make_values = function() {
    return _.values(this.args);
  };

  CustomJS.prototype._make_func = function() {
    return (function(func, args, ctor) {
      ctor.prototype = func.prototype;
      var child = new ctor, result = func.apply(child, args);
      return Object(result) === result ? result : child;
    })(Function, slice.call(_.keys(this.args)).concat(["cb_obj"], ["cb_data"], ["require"], [this.code]), function(){});
  };

  return CustomJS;

})(Model);

module.exports = {
  Model: CustomJS
};
