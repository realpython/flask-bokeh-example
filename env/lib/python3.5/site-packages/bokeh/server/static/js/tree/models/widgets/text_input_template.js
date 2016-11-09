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
      __out.push('<label for="');
      __out.push(__sanitize(this.id));
      __out.push('"> ');
      __out.push(__sanitize(this.title));
      __out.push(' </label>\n<input class="bk-widget-form-input" type="text" id="');
      __out.push(__sanitize(this.id));
      __out.push('" name="');
      __out.push(__sanitize(this.name));
      __out.push('" value="');
      __out.push(__sanitize(this.value));
      __out.push('"/>\n');
    }).call(this);
  }).call(__obj);
  return __out.join('');
};