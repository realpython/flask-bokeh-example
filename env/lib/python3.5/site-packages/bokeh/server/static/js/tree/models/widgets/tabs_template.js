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
      var i, j, k, len, len1, ref, ref1, tab;
      __out.push('<ul class="bk-bs-nav bk-bs-nav-tabs">\n  ');
      ref = this.tabs;
      for (i = j = 0, len = ref.length; j < len; i = ++j) {
        tab = ref[i];
        __out.push('\n    <li class="');
        __out.push(__sanitize(this.active(i)));
        __out.push('">\n      <a href="#tab-');
        __out.push(__sanitize(tab.id));
        __out.push('">');
        __out.push(__sanitize(tab.title));
        __out.push('</a>\n    </li>\n  ');
      }
      __out.push('\n</ul>\n<div class="bk-bs-tab-content">\n  ');
      ref1 = this.tabs;
      for (i = k = 0, len1 = ref1.length; k < len1; i = ++k) {
        tab = ref1[i];
        __out.push('\n    <div class="bk-bs-tab-pane ');
        __out.push(__sanitize(this.active(i)));
        __out.push('" id="tab-');
        __out.push(__sanitize(tab.id));
        __out.push('"></div>\n  ');
      }
      __out.push('\n</div>\n');
    }).call(this);
  }).call(__obj);
  return __out.join('');
};