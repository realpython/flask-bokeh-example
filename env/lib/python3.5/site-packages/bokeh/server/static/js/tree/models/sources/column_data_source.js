var ColumnDataSource, DataSource, SelectionManager, _, hittest, logger, p,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

DataSource = require('./data_source');

hittest = require("../../core/hittest");

SelectionManager = require("../../core/selection_manager");

logger = require("../../core/logging").logger;

p = require("../../core/properties");

ColumnDataSource = (function(superClass) {
  extend(ColumnDataSource, superClass);

  function ColumnDataSource() {
    return ColumnDataSource.__super__.constructor.apply(this, arguments);
  }

  ColumnDataSource.prototype.type = 'ColumnDataSource';

  ColumnDataSource.define({
    data: [p.Any, {}],
    column_names: [p.Array, []]
  });

  ColumnDataSource.internal({
    selection_manager: [
      p.Instance, function(self) {
        return new SelectionManager({
          source: self
        });
      }
    ],
    inspected: [p.Any]
  });

  ColumnDataSource.prototype.get_column = function(colname) {
    var ref;
    return (ref = this.data[colname]) != null ? ref : null;
  };

  ColumnDataSource.prototype.get_length = function() {
    var data, key, lengths, val;
    data = this.data;
    if (_.keys(data).length === 0) {
      return null;
    } else {
      lengths = _.uniq((function() {
        var results;
        results = [];
        for (key in data) {
          val = data[key];
          results.push(val.length);
        }
        return results;
      })());
      if (lengths.length > 1) {
        logger.debug("data source has columns of inconsistent lengths");
      }
      return lengths[0];
    }
  };

  ColumnDataSource.prototype.columns = function() {
    return _.keys(this.data);
  };

  ColumnDataSource.prototype.stream = function(new_data, rollover) {
    var data, k, v;
    data = this.data;
    for (k in new_data) {
      v = new_data[k];
      data[k] = data[k].concat(new_data[k]);
      if (data[k].length > rollover) {
        data[k] = data[k].slice(-rollover);
      }
    }
    this.setv('data', data, {
      silent: true
    });
    return this.trigger('stream');
  };

  ColumnDataSource.prototype.patch = function(patches) {
    var data, i, ind, j, k, patch, ref, ref1, value;
    data = this.data;
    for (k in patches) {
      patch = patches[k];
      for (i = j = 0, ref = patch.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
        ref1 = patch[i], ind = ref1[0], value = ref1[1];
        data[k][ind] = value;
      }
    }
    this.setv('data', data, {
      silent: true
    });
    return this.trigger('patch');
  };

  return ColumnDataSource;

})(DataSource.Model);

module.exports = {
  Model: ColumnDataSource
};
