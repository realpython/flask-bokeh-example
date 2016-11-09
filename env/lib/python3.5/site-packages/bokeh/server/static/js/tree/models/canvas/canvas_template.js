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
      if (this.map) {
        __out.push('\n<div class="bk-canvas-map"></div>\n');
      }
      __out.push('\n<div class="bk-canvas-events" />\n<div class="bk-canvas-overlays" />\n<canvas class=\'bk-canvas\'></canvas>');
    }).call(this);
  }).call(__obj);
  return __out.join('');
};