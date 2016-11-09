var _, patch;

_ = require("underscore");

patch = function() {
  return _.uniqueId = function(prefix) {
    var hexDigits, i, j, s, uuid;
    s = [];
    hexDigits = "0123456789ABCDEF";
    for (i = j = 0; j <= 31; i = ++j) {
      s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[12] = "4";
    s[16] = hexDigits.substr((s[16] & 0x3) | 0x8, 1);
    uuid = s.join("");
    if (prefix) {
      return prefix + "-" + uuid;
    } else {
      return uuid;
    }
  };
};

_.isNullOrUndefined = function(x) {
  return _.isNull(x) || _.isUndefined(x);
};

_.setdefault = function(obj, key, value) {
  if (_.has(obj, key)) {
    return obj[key];
  } else {
    obj[key] = value;
    return value;
  }
};

module.exports = {
  patch: patch
};
