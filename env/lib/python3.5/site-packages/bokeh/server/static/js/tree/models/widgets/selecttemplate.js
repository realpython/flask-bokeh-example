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
      var i, len, option, ref;
      __out.push('<label for="');
      __out.push(__sanitize(this.id));
      __out.push('"> ');
      __out.push(__sanitize(this.title));
      __out.push(' </label>\n<select class="bk-widget-form-input" id="');
      __out.push(__sanitize(this.id));
      __out.push('" name="');
      __out.push(__sanitize(this.name));
      __out.push('">\n  ');
      ref = this.options;
      for (i = 0, len = ref.length; i < len; i++) {
        option = ref[i];
        __out.push('\n    ');
        if (typeof option === "string") {
          __out.push('\n      <option ');
          __out.push(__sanitize(option === this.value ? __out.push('selected="selected"') : void 0));
          __out.push(' value="');
          __out.push(__sanitize(option));
          __out.push('">');
          __out.push(__sanitize(option));
          __out.push('</option>\n    ');
        } else {
          __out.push('\n      <option ');
          __out.push(__sanitize(option[0] === this.value ? __out.push('selected="selected"') : void 0));
          __out.push(' value="');
          __out.push(__sanitize(option[0]));
          __out.push('">');
          __out.push(__sanitize(option[1]));
          __out.push('</option>\n    ');
        }
        __out.push('\n  ');
      }
      __out.push('\n</select>\n');
    }).call(this);
  }).call(__obj);
  return __out.join('');
};