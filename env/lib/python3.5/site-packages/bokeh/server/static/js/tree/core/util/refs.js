var HasProps, _, convert_to_ref, create_ref, is_ref;

_ = require("underscore");

HasProps = require("../has_props");

create_ref = function(obj) {
  var ref;
  if (!(obj instanceof HasProps.constructor)) {
    throw new Error("can only create refs for HasProps subclasses");
  }
  ref = {
    'type': obj.type,
    'id': obj.id
  };
  if (obj._subtype != null) {
    ref['subtype'] = obj._subtype;
  }
  return ref;
};

is_ref = function(arg) {
  var keys;
  if (_.isObject(arg)) {
    keys = _.keys(arg).sort();
    if (keys.length === 2) {
      return keys[0] === 'id' && keys[1] === 'type';
    }
    if (keys.length === 3) {
      return keys[0] === 'id' && keys[1] === 'subtype' && keys[2] === 'type';
    }
  }
  return false;
};

convert_to_ref = function(value) {
  if (_.isArray(value)) {
    return _.map(value, convert_to_ref);
  } else {
    if (value instanceof HasProps.constructor) {
      return value.ref();
    }
  }
};

module.exports = {
  convert_to_ref: convert_to_ref,
  create_ref: create_ref,
  is_ref: is_ref
};
