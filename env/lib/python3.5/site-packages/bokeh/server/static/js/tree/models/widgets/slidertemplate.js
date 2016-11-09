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
      __out.push('<div class="bk-slider-parent">\n  ');
      if (this.title != null) {
        __out.push('\n    ');
        if (this.title.length !== 0) {
          __out.push('\n      <label for="');
          __out.push(__sanitize(this.id));
          __out.push('"> ');
          __out.push(__sanitize(this.title));
          __out.push(': </label>\n    ');
        }
        __out.push('\n    <input type="text" id="');
        __out.push(__sanitize(this.id));
        __out.push('" readonly>\n  ');
      }
      __out.push('\n  <div class="bk-slider-');
      __out.push(__sanitize(this.orientation));
      __out.push('">\n    <div class="slider" id="');
      __out.push(__sanitize(this.id));
      __out.push('"></div>\n  </div>\n</div>\n');
    }).call(this);
  }).call(__obj);
  return __out.join('');
};