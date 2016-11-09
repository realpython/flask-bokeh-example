var MultiDict, Set, _;

_ = require("underscore");

MultiDict = (function() {
  function MultiDict() {
    this._dict = {};
  }

  MultiDict.prototype._existing = function(key) {
    if (key in this._dict) {
      return this._dict[key];
    } else {
      return null;
    }
  };

  MultiDict.prototype.add_value = function(key, value) {
    var existing;
    if (value === null) {
      throw new Error("Can't put null in this dict");
    }
    if (_.isArray(value)) {
      throw new Error("Can't put arrays in this dict");
    }
    existing = this._existing(key);
    if (existing === null) {
      return this._dict[key] = value;
    } else if (_.isArray(existing)) {
      return existing.push(value);
    } else {
      return this._dict[key] = [existing, value];
    }
  };

  MultiDict.prototype.remove_value = function(key, value) {
    var existing, new_array;
    existing = this._existing(key);
    if (_.isArray(existing)) {
      new_array = _.without(existing, value);
      if (new_array.length > 0) {
        return this._dict[key] = new_array;
      } else {
        return delete this._dict[key];
      }
    } else if (_.isEqual(existing, value)) {
      return delete this._dict[key];
    }
  };

  MultiDict.prototype.get_one = function(key, duplicate_error) {
    var existing;
    existing = this._existing(key);
    if (_.isArray(existing)) {
      if (existing.length === 1) {
        return existing[0];
      } else {
        throw new Error(duplicate_error);
      }
    } else {
      return existing;
    }
  };

  return MultiDict;

})();

Set = (function() {
  function Set(array) {
    if (!array) {
      this.values = [];
    } else {
      if (array.constructor === Set) {
        return new Set(array.values);
      }
      if (array.constructor === Array) {
        this.values = Set.compact(array);
      } else {
        this.values = [array];
      }
    }
  }

  Set.compact = function(array) {
    var item, j, len, newArray;
    newArray = [];
    for (j = 0, len = array.length; j < len; j++) {
      item = array[j];
      if (newArray.indexOf(item) === -1) {
        newArray.push(item);
      }
    }
    return newArray;
  };

  Set.prototype.push = function(item) {
    if (this.missing(item)) {
      return this.values.push(item);
    }
  };

  Set.prototype.remove = function(item) {
    var i;
    i = this.values.indexOf(item);
    return this.values = this.values.slice(0, i).concat(this.values.slice(i + 1));
  };

  Set.prototype.length = function() {
    return this.values.length;
  };

  Set.prototype.includes = function(item) {
    return this.values.indexOf(item) !== -1;
  };

  Set.prototype.missing = function(item) {
    return !this.includes(item);
  };

  Set.prototype.slice = function(from, to) {
    return this.values.slice(from, to);
  };

  Set.prototype.join = function(str) {
    return this.values.join(str);
  };

  Set.prototype.toString = function() {
    return this.join(', ');
  };

  Set.prototype.includes = function(item) {
    return this.values.indexOf(item) !== -1;
  };

  Set.prototype.union = function(set) {
    set = new Set(set);
    return new Set(this.values.concat(set.values));
  };

  Set.prototype.intersect = function(set) {
    var item, j, len, newSet, ref;
    set = new Set(set);
    newSet = new Set;
    ref = set.values;
    for (j = 0, len = ref.length; j < len; j++) {
      item = ref[j];
      if (this.includes(item) && set.includes(item)) {
        newSet.push(item);
      }
    }
    return newSet;
  };

  Set.prototype.diff = function(set) {
    var item, j, len, newSet, ref;
    set = new Set(set);
    newSet = new Set;
    ref = this.values;
    for (j = 0, len = ref.length; j < len; j++) {
      item = ref[j];
      if (set.missing(item)) {
        newSet.push(item);
      }
    }
    return newSet;
  };

  return Set;

})();

module.exports = {
  MultiDict: MultiDict,
  Set: Set
};
