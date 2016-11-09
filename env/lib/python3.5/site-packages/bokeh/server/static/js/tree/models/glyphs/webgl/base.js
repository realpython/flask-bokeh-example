var BaseGLGlyph, _, attach_color, attach_float, color, color2rgba, fill_array_with_float, fill_array_with_vec, line_width, visual_prop_is_singular;

_ = require("underscore");

color = require("../../../core/util/color");

color2rgba = color.color2rgba;

BaseGLGlyph = (function() {
  BaseGLGlyph.prototype.GLYPH = '';

  BaseGLGlyph.prototype.VERT = '';

  BaseGLGlyph.prototype.FRAG = '';

  function BaseGLGlyph(gl, glyph) {
    this.gl = gl;
    this.glyph = glyph;
    this.nvertices = 0;
    this.size_changed = false;
    this.data_changed = false;
    this.visuals_changed = false;
    this.init();
  }

  BaseGLGlyph.prototype.set_data_changed = function(n) {
    if (n !== this.nvertices) {
      this.nvertices = n;
      this.size_changed = true;
    }
    return this.data_changed = true;
  };

  BaseGLGlyph.prototype.set_visuals_changed = function() {
    return this.visuals_changed = true;
  };

  BaseGLGlyph.prototype.render = function(ctx, indices, mainglyph) {
    var dx, dy, ref, ref1, ref2, sx, sy, trans, wx, wy;
    wx = wy = 1;
    ref = this.glyph.renderer.map_to_screen([0 * wx, 1 * wx, 2 * wx], [0 * wy, 1 * wy, 2 * wy]), dx = ref[0], dy = ref[1];
    wx = 100 / Math.min(Math.max(Math.abs(dx[1] - dx[0]), 1e-12), 1e12);
    wy = 100 / Math.min(Math.max(Math.abs(dy[1] - dy[0]), 1e-12), 1e12);
    ref1 = this.glyph.renderer.map_to_screen([0 * wx, 1 * wx, 2 * wx], [0 * wy, 1 * wy, 2 * wy]), dx = ref1[0], dy = ref1[1];
    if (Math.abs((dx[1] - dx[0]) - (dx[2] - dx[1])) > 1e-6 || Math.abs((dy[1] - dy[0]) - (dy[2] - dy[1])) > 1e-6) {
      return false;
    }
    ref2 = [(dx[1] - dx[0]) / wx, (dy[1] - dy[0]) / wy], sx = ref2[0], sy = ref2[1];
    trans = {
      pixel_ratio: ctx.pixel_ratio,
      width: ctx.glcanvas.width,
      height: ctx.glcanvas.height,
      dx: dx[0] / sx,
      dy: dy[0] / sy,
      sx: sx,
      sy: sy
    };
    this.draw(indices, mainglyph, trans);
    return true;
  };

  return BaseGLGlyph;

})();

line_width = function(width) {
  if (width < 2) {
    width = Math.sqrt(width * 2);
  }
  return width;
};

fill_array_with_float = function(n, val) {
  var a, i, k, ref;
  a = new Float32Array(n);
  for (i = k = 0, ref = n; 0 <= ref ? k < ref : k > ref; i = 0 <= ref ? ++k : --k) {
    a[i] = val;
  }
  return a;
};

fill_array_with_vec = function(n, m, val) {
  var a, i, j, k, l, ref, ref1;
  a = new Float32Array(n * m);
  for (i = k = 0, ref = n; 0 <= ref ? k < ref : k > ref; i = 0 <= ref ? ++k : --k) {
    for (j = l = 0, ref1 = m; 0 <= ref1 ? l < ref1 : l > ref1; j = 0 <= ref1 ? ++l : --l) {
      a[i * m + j] = val[j];
    }
  }
  return a;
};

visual_prop_is_singular = function(visual, propname) {
  return !_.isUndefined(visual[propname].spec.value);
};

attach_float = function(prog, vbo, att_name, n, visual, name) {
  var a;
  if (!visual.doit) {
    vbo.used = false;
    return prog.set_attribute(att_name, 'float', [0]);
  } else if (visual_prop_is_singular(visual, name)) {
    vbo.used = false;
    return prog.set_attribute(att_name, 'float', visual[name].value());
  } else {
    vbo.used = true;
    a = new Float32Array(visual.cache[name + '_array']);
    vbo.set_size(n * 4);
    vbo.set_data(0, a);
    return prog.set_attribute(att_name, 'float', vbo);
  }
};

attach_color = function(prog, vbo, att_name, n, visual, prefix) {
  var a, alphaname, alphas, colorname, colors, i, j, k, l, m, ref, ref1, rgba;
  m = 4;
  colorname = prefix + '_color';
  alphaname = prefix + '_alpha';
  if (!visual.doit) {
    vbo.used = false;
    return prog.set_attribute(att_name, 'vec4', [0, 0, 0, 0]);
  } else if (visual_prop_is_singular(visual, colorname) && visual_prop_is_singular(visual, alphaname)) {
    vbo.used = false;
    rgba = color2rgba(visual[colorname].value(), visual[alphaname].value());
    return prog.set_attribute(att_name, 'vec4', rgba);
  } else {
    vbo.used = true;
    if (visual_prop_is_singular(visual, colorname)) {
      colors = (function() {
        var k, ref, results;
        results = [];
        for (i = k = 0, ref = n; 0 <= ref ? k < ref : k > ref; i = 0 <= ref ? ++k : --k) {
          results.push(visual[colorname].value());
        }
        return results;
      })();
    } else {
      colors = visual.cache[colorname + '_array'];
    }
    if (visual_prop_is_singular(visual, alphaname)) {
      alphas = fill_array_with_float(n, visual[alphaname].value());
    } else {
      alphas = visual.cache[alphaname + '_array'];
    }
    a = new Float32Array(n * m);
    for (i = k = 0, ref = n; 0 <= ref ? k < ref : k > ref; i = 0 <= ref ? ++k : --k) {
      rgba = color2rgba(colors[i], alphas[i]);
      for (j = l = 0, ref1 = m; 0 <= ref1 ? l < ref1 : l > ref1; j = 0 <= ref1 ? ++l : --l) {
        a[i * m + j] = rgba[j];
      }
    }
    vbo.set_size(n * m * 4);
    vbo.set_data(0, a);
    return prog.set_attribute(att_name, 'vec4', vbo);
  }
};

module.exports = {
  BaseGLGlyph: BaseGLGlyph,
  line_width: line_width,
  attach_float: attach_float,
  attach_color: attach_color,
  color2rgba: color2rgba
};
