module.exports = function(__obj) {
  if (!__obj) __obj = {};
  var __out = [];
  var __capture = function(callback) {
    var out = __out, result;
    __out = [];
    callback.call(this);
    result = __out.join('');
    __out = out;
    return __safe(result);
  };
  var __sanitize = function(value) {
    if (value && value.ecoSafe) {
      return value;
    } else if (typeof value !== 'undefined' && value != null) {
      return __escape(value);
    } else {
      return '';
    }
  };
  var __safe = function(value) {
    if (value && value.ecoSafe) {
      return value;
    } else {
      if (!(typeof value !== 'undefined' && value != null)) value = '';
      var result = new String(value);
      result.ecoSafe = true;
      return result;
    }
  };
  var __escape = function(value) {
    return ('' + value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  };
  (function() {
    (function() {
      __out.push('<button type="button" class="bk-bs-btn bk-bs-btn-');
      __out.push(__sanitize(this.button_type));
      __out.push(' bk-bs-dropdown-toggle bk-bs-dropdown-btn" data-bk-bs-toggle="dropdown">\n  ');
      __out.push(__sanitize(this.label));
      __out.push(' <span class="bk-bs-caret"></span>\n</button>\n<ul class="bk-bs-dropdown-menu">\n</ul>\n');
    }).call(this);
  }).call(__obj);
  return __out.join('');
};