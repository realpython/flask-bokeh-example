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
      __out.push('<div class="bk-toolbar-');
      __out.push(__sanitize(this.location));
      __out.push(' bk-plot-');
      __out.push(__sanitize(this.location));
      __out.push(' bk-toolbar-');
      __out.push(__sanitize(this.sticky));
      __out.push(' bk-toolbar-active">\n  ');
      if ((this.logo != null) && this.logo === "grey") {
        __out.push('\n    <a href=\'http://bokeh.pydata.org/\' target=\'_blank\' class=\'bk-logo bk-logo-small grey\'></a>\n  ');
      } else if (this.logo != null) {
        __out.push('\n  <a href=\'http://bokeh.pydata.org/\' target=\'_blank\' class=\'bk-logo bk-logo-small\'></a>\n  ');
      }
      __out.push('\n  <div class=\'bk-button-bar\'>\n    <ul class=\'bk-button-bar-list\' type="pan" />\n    <ul class=\'bk-button-bar-list\' type="scroll" />\n    <ul class=\'bk-button-bar-list\' type="pinch" />\n    <ul class=\'bk-button-bar-list\' type="tap" />\n    <ul class=\'bk-button-bar-list\' type="press" />\n    <ul class=\'bk-button-bar-list\' type="rotate" />\n    <ul class=\'bk-button-bar-list\' type="actions" />\n    <div class=\'bk-button-bar-list bk-bs-dropdown\' type="inspectors" />\n    <ul class=\'bk-button-bar-list\' type="help" />\n  </div>\n</div>\n');
    }).call(this);
  }).call(__obj);
  return __out.join('');
};