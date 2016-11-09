var Numbro, SPrintf, _, _format_number, replace_placeholders;

_ = require("underscore");

SPrintf = require("sprintf");

Numbro = require("numbro");

_format_number = function(number) {
  var format;
  if (_.isNumber(number)) {
    format = (function() {
      switch (false) {
        case Math.floor(number) !== number:
          return "%d";
        case !(Math.abs(number) > 0.1 && Math.abs(number) < 1000):
          return "%0.3f";
        default:
          return "%0.3e";
      }
    })();
    return SPrintf.sprintf(format, number);
  } else {
    return "" + number;
  }
};

replace_placeholders = function(string, data_source, i, special_vars) {
  if (special_vars == null) {
    special_vars = {};
  }
  string = string.replace(/(^|[^\$])\$(\w+)/g, (function(_this) {
    return function(match, prefix, name) {
      return prefix + "@$" + name;
    };
  })(this));
  string = string.replace(/(^|[^@])@(?:(\$?\w+)|{([^{}]+)})(?:{([^{}]+)})?/g, (function(_this) {
    return function(match, prefix, name, long_name, format) {
      var ref, replacement, value;
      name = long_name != null ? long_name : name;
      value = name[0] === "$" ? special_vars[name.substring(1)] : (ref = data_source.get_column(name)) != null ? ref[i] : void 0;
      replacement = value == null ? "???" : format != null ? Numbro.format(value, format) : _format_number(value);
      return "" + prefix + (_.escape(replacement));
    };
  })(this));
  return string;
};

module.exports = {
  replace_placeholders: replace_placeholders
};
