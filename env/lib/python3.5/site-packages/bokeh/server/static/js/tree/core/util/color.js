var _component2hex, color2hex, color2rgba, svg_colors, valid_rgb,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

svg_colors = require("./svg_colors");

_component2hex = function(v) {
  var h;
  h = Number(v).toString(16);
  return h = h.length === 1 ? '0' + h : h;
};

color2hex = function(color) {
  var hex, rgb, v;
  color = color + '';
  if (color.indexOf('#') === 0) {
    return color;
  } else if (svg_colors[color] != null) {
    return svg_colors[color];
  } else if (color.indexOf('rgb') === 0) {
    rgb = color.match(/\d+/g);
    hex = ((function() {
      var j, len, results;
      results = [];
      for (j = 0, len = rgb.length; j < len; j++) {
        v = rgb[j];
        results.push(_component2hex(v));
      }
      return results;
    })()).join('');
    return '#' + hex.slice(0, 8);
  } else {
    return color;
  }
};

color2rgba = function(color, alpha) {
  var hex, i, rgba;
  if (alpha == null) {
    alpha = 1;
  }
  if (!color) {
    return [0, 0, 0, 0];
  }
  hex = color2hex(color);
  hex = hex.replace(/ |#/g, '');
  if (hex.length <= 4) {
    hex = hex.replace(/(.)/g, '$1$1');
  }
  hex = hex.match(/../g);
  rgba = (function() {
    var j, len, results;
    results = [];
    for (j = 0, len = hex.length; j < len; j++) {
      i = hex[j];
      results.push(parseInt(i, 16) / 255);
    }
    return results;
  })();
  while (rgba.length < 3) {
    rgba.push(0);
  }
  if (rgba.length < 4) {
    rgba.push(alpha);
  }
  return rgba.slice(0, 4);
};

valid_rgb = function(value) {
  var contents, params, ref, rgb;
  switch (value.substring(0, 4)) {
    case "rgba":
      params = {
        start: "rgba(",
        len: 4,
        alpha: true
      };
      break;
    case "rgb(":
      params = {
        start: "rgb(",
        len: 3,
        alpha: false
      };
      break;
    default:
      return false;
  }
  if (new RegExp(".*?(\\.).*(,)").test(value)) {
    throw new Error("color expects integers for rgb in rgb/rgba tuple, received " + value);
  }
  contents = value.replace(params.start, "").replace(")", "").split(',').map(parseFloat);
  if (contents.length !== params.len) {
    throw new Error("color expects rgba " + expect_len + "-tuple, received " + value);
  }
  if (params.alpha && !((0 <= (ref = contents[3]) && ref <= 1))) {
    throw new Error("color expects rgba 4-tuple to have alpha value between 0 and 1");
  }
  if (indexOf.call((function() {
    var j, len, ref1, results;
    ref1 = contents.slice(0, 3);
    results = [];
    for (j = 0, len = ref1.length; j < len; j++) {
      rgb = ref1[j];
      results.push((0 <= rgb && rgb <= 255));
    }
    return results;
  })(), false) >= 0) {
    throw new Error("color expects rgb to have value between 0 and 255");
  }
  return true;
};

module.exports = {
  color2hex: color2hex,
  color2rgba: color2rgba,
  valid_rgb: valid_rgb
};
