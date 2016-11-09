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
      __out.push('<div class="bk-bs-modal" tabindex="-1">\n  <div class="bk-bs-modal-dialog">\n    <div class="bk-bs-modal-content">\n      <div class="bk-bs-modal-header">\n        ');
      if (this.closable) {
        __out.push('\n          <button type="button" class="bk-bs-close" data-bk-bs-dismiss="modal">&times;</button>\n        ');
      }
      __out.push('\n        <h4 class="bk-bs-modal-title">');
      __out.push(__sanitize(this.title));
      __out.push('</h4>\n      </div>\n      <div class="bk-bs-modal-body">\n        <div class="bk-dialog-content" />\n      </div>\n      <div class="bk-bs-modal-footer">\n        <div class="bk-dialog-buttons_box" />\n      </div>\n    </div>\n  </div>\n</div>\n');
    }).call(this);
  }).call(__obj);
  return __out.join('');
};