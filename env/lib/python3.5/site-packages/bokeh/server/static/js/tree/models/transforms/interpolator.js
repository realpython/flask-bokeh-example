var Interpolator, Transform, _, logger, p,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

_ = require("underscore");

Transform = require("./transform");

p = require("../../core/properties");

logger = require("../../core/logging").logger;

Interpolator = (function(superClass) {
  extend(Interpolator, superClass);

  function Interpolator() {
    return Interpolator.__super__.constructor.apply(this, arguments);
  }

  Interpolator.prototype.initialize = function(attrs, options) {
    Interpolator.__super__.initialize.call(this, attrs, options);
    this._x_sorted = [];
    this._y_sorted = [];
    this._sorted_dirty = true;
    return this.on('change', function() {
      return this._sorted_dirty = true;
    });
  };

  Interpolator.define({
    x: [p.Any],
    y: [p.Any],
    data: [p.Any],
    clip: [p.Bool, true]
  });

  Interpolator.prototype.sort = function(descending) {
    var column_names, data, i, j, k, list, ref, ref1, ref2, tsx, tsy;
    if (descending == null) {
      descending = false;
    }
    if (typeof this.x !== typeof this.y) {
      throw Error('The parameters for x and y must be of the same type, either both strings which define a column in the data source or both arrays of the same length');
      return;
    } else {
      if (typeof this.x === 'string' && this.data === null) {
        throw Error('If the x and y parameters are not specified as an array, the data parameter is reqired.');
        return;
      }
    }
    if (this._sorted_dirty === false) {
      return;
    }
    tsx = [];
    tsy = [];
    if (typeof this.x === 'string') {
      data = this.data;
      column_names = data.columns();
      if (ref = this.x, indexOf.call(column_names, ref) < 0) {
        throw Error('The x parameter does not correspond to a valid column name defined in the data parameter');
      }
      if (ref1 = this.y, indexOf.call(column_names, ref1) < 0) {
        throw Error('The x parameter does not correspond to a valid column name defined in the data parameter');
      }
      tsx = data.get_column(this.x);
      tsy = data.get_column(this.y);
    } else {
      tsx = this.x;
      tsy = this.y;
    }
    if (tsx.length !== tsy.length) {
      throw Error('The length for x and y do not match');
    }
    if (tsx.length < 2) {
      throw Error('x and y must have at least two elements to support interpolation');
    }
    list = [];
    for (j in tsx) {
      list.push({
        'x': tsx[j],
        'y': tsy[j]
      });
    }
    if (descending === true) {
      list.sort(function(a, b) {
        var ref2, ref3;
        return (ref2 = a.x < b.x) != null ? ref2 : -{
          1: (ref3 = a.x === b.x) != null ? ref3 : {
            0: 1
          }
        };
      });
    } else {
      list.sort(function(a, b) {
        var ref2, ref3;
        return (ref2 = a.x > b.x) != null ? ref2 : -{
          1: (ref3 = a.x === b.x) != null ? ref3 : {
            0: 1
          }
        };
      });
    }
    for (k = i = 0, ref2 = list.length - 1; 0 <= ref2 ? i <= ref2 : i >= ref2; k = 0 <= ref2 ? ++i : --i) {
      this._x_sorted[k] = list[k].x;
      this._y_sorted[k] = list[k].y;
    }
    return this._sorted_dirty = false;
  };

  return Interpolator;

})(Transform.Model);

module.exports = {
  Model: Interpolator
};
