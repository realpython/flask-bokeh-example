var DataSource, Model, _, hittest, p,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

Model = require("../../model");

hittest = require("../../core/hittest");

p = require("../../core/properties");

DataSource = (function(superClass) {
  extend(DataSource, superClass);

  function DataSource() {
    return DataSource.__super__.constructor.apply(this, arguments);
  }

  DataSource.prototype.type = 'DataSource';

  DataSource.define({
    selected: [p.Any, hittest.create_hit_test_result()],
    callback: [p.Any]
  });

  DataSource.prototype.initialize = function(options) {
    DataSource.__super__.initialize.call(this, options);
    return this.listenTo(this, 'change:selected', (function(_this) {
      return function() {
        var callback;
        callback = _this.callback;
        if (callback != null) {
          if (_.isFunction(callback)) {
            return callback(_this);
          } else {
            return callback.execute(_this);
          }
        }
      };
    })(this));
  };

  return DataSource;

})(Model);

module.exports = {
  Model: DataSource
};
