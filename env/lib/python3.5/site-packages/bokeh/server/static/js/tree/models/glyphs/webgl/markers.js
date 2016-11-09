var AnnulusGLGlyph, AsteriskGLGlyph, BaseGLGlyph, CircleCrossGLGlyph, CircleGLGlyph, CircleXGLGlyph, CrossGLGlyph, DiamondCrossGLGlyph, DiamondGLGlyph, InvertedTriangleGLGlyph, MarkerGLGlyph, SquareCrossGLGlyph, SquareGLGlyph, SquareXGLGlyph, TriangleGLGlyph, XGLGlyph, attach_color, attach_float, gloo2, line_width, logger, ref,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

gloo2 = require("gloo2");

logger = require("../../../core/logging").logger;

ref = require("./base"), BaseGLGlyph = ref.BaseGLGlyph, line_width = ref.line_width, attach_float = ref.attach_float, attach_color = ref.attach_color;

MarkerGLGlyph = (function(superClass) {
  extend(MarkerGLGlyph, superClass);

  function MarkerGLGlyph() {
    return MarkerGLGlyph.__super__.constructor.apply(this, arguments);
  }

  MarkerGLGlyph.prototype.VERT = "precision mediump float;\nconst float SQRT_2 = 1.4142135623730951;\n//\nuniform float u_pixel_ratio;\nuniform vec2 u_canvas_size;\nuniform vec2 u_offset;\nuniform vec2 u_scale;\nuniform float u_antialias;\n//\nattribute float a_x;\nattribute float a_y;\nattribute float a_size;\nattribute float a_angle;  // in radians\nattribute float a_linewidth;\nattribute vec4  a_fg_color;\nattribute vec4  a_bg_color;\n//\nvarying float v_linewidth;\nvarying float v_size;\nvarying vec4  v_fg_color;\nvarying vec4  v_bg_color;\nvarying vec2  v_rotation;\n\nvoid main (void)\n{\n    v_size = a_size * u_pixel_ratio;\n    v_linewidth = a_linewidth * u_pixel_ratio;\n    v_fg_color = a_fg_color;\n    v_bg_color = a_bg_color;\n    v_rotation = vec2(cos(-a_angle), sin(-a_angle));\n    // Calculate position - the -0.5 is to correct for canvas origin\n    vec2 pos = (vec2(a_x, a_y) + u_offset) * u_scale; // in pixels\n    pos += 0.5;  // make up for Bokeh's offset\n    pos /= u_canvas_size / u_pixel_ratio;  // in 0..1\n    gl_Position = vec4(pos*2.0-1.0, 0.0, 1.0);\n    gl_Position.y *= -1.0;\n    gl_PointSize = SQRT_2 * v_size + 2.0 * (v_linewidth + 1.5*u_antialias);\n}";

  MarkerGLGlyph.prototype.FRAG = "precision mediump float;\nconst float SQRT_2 = 1.4142135623730951;\nconst float PI = 3.14159265358979323846264;\n//\nuniform float u_antialias;\n//\nvarying vec4  v_fg_color;\nvarying vec4  v_bg_color;\nvarying float v_linewidth;\nvarying float v_size;\nvarying vec2  v_rotation;\n\nMARKERCODE\n\nvec4 outline(float distance, float linewidth, float antialias, vec4 fg_color, vec4 bg_color)\n{\n    vec4 frag_color;\n    float t = linewidth/2.0 - antialias;\n    float signed_distance = distance;\n    float border_distance = abs(signed_distance) - t;\n    float alpha = border_distance/antialias;\n    alpha = exp(-alpha*alpha);\n\n    // If fg alpha is zero, it probably means no outline. To avoid a dark outline\n    // shining through due to aa, we set the fg color to the bg color. Avoid if (i.e. branching).\n    float select = float(bool(fg_color.a));\n    fg_color.rgb = select * fg_color.rgb + (1.0  - select) * bg_color.rgb;\n    // Similarly, if we want a transparent bg\n    select = float(bool(bg_color.a));\n    bg_color.rgb = select * bg_color.rgb + (1.0  - select) * fg_color.rgb;\n\n    if( border_distance < 0.0)\n        frag_color = fg_color;\n    else if( signed_distance < 0.0 ) {\n        frag_color = mix(bg_color, fg_color, sqrt(alpha));\n    } else {\n        if( abs(signed_distance) < (linewidth/2.0 + antialias) ) {\n            frag_color = vec4(fg_color.rgb, fg_color.a * alpha);\n        } else {\n            discard;\n        }\n    }\n    return frag_color;\n}\n\nvoid main()\n{\n    vec2 P = gl_PointCoord.xy - vec2(0.5, 0.5);\n    P = vec2(v_rotation.x*P.x - v_rotation.y*P.y,\n             v_rotation.y*P.x + v_rotation.x*P.y);\n    float point_size = SQRT_2*v_size  + 2.0 * (v_linewidth + 1.5*u_antialias);\n    float distance = marker(P*point_size, v_size);\n    gl_FragColor = outline(distance, v_linewidth, u_antialias, v_fg_color, v_bg_color);\n    //gl_FragColor.rgb *= gl_FragColor.a;  // pre-multiply alpha\n}";

  MarkerGLGlyph.prototype.MARKERCODE = "<defined in subclasses>";

  MarkerGLGlyph.prototype.init = function() {
    var frag, gl;
    gl = this.gl;
    frag = this.FRAG.replace(/MARKERCODE/, this.MARKERCODE);
    this.last_trans = {};
    this.prog = new gloo2.Program(gl);
    this.prog.set_shaders(this.VERT, frag);
    this.vbo_x = new gloo2.VertexBuffer(gl);
    this.prog.set_attribute('a_x', 'float', this.vbo_x);
    this.vbo_y = new gloo2.VertexBuffer(gl);
    this.prog.set_attribute('a_y', 'float', this.vbo_y);
    this.vbo_s = new gloo2.VertexBuffer(gl);
    this.prog.set_attribute('a_size', 'float', this.vbo_s);
    this.vbo_a = new gloo2.VertexBuffer(gl);
    this.prog.set_attribute('a_angle', 'float', this.vbo_a);
    this.vbo_linewidth = new gloo2.VertexBuffer(gl);
    this.vbo_fg_color = new gloo2.VertexBuffer(gl);
    this.vbo_bg_color = new gloo2.VertexBuffer(gl);
    return this.index_buffer = new gloo2.IndexBuffer(gl);
  };

  MarkerGLGlyph.prototype.draw = function(indices, mainGlyph, trans) {
    var baked_offset, chunk, chunks, chunksize, i, j, k, l, mainGlGlyph, nvertices, offset, ref1, ref2, ref3, results, s, these_indices, ua, uint16_index;
    mainGlGlyph = mainGlyph.glglyph;
    nvertices = mainGlGlyph.nvertices;
    if (mainGlGlyph.data_changed) {
      if (!(isFinite(trans.dx) && isFinite(trans.dy))) {
        return;
      }
      mainGlGlyph._baked_offset = [trans.dx, trans.dy];
      mainGlGlyph._set_data(nvertices);
      mainGlGlyph.data_changed = false;
    } else if ((this.glyph._radius != null) && (trans.sx !== this.last_trans.sx || trans.sy !== this.last_trans.sy)) {
      this.last_trans = trans;
      this.vbo_s.set_data(0, new Float32Array((function() {
        var j, len, ref1, results;
        ref1 = this.glyph.sradius;
        results = [];
        for (j = 0, len = ref1.length; j < len; j++) {
          s = ref1[j];
          results.push(s * 2);
        }
        return results;
      }).call(this)));
    }
    if (this.visuals_changed) {
      this._set_visuals(nvertices);
      this.visuals_changed = false;
    }
    baked_offset = mainGlGlyph._baked_offset;
    this.prog.set_uniform('u_pixel_ratio', 'float', [trans.pixel_ratio]);
    this.prog.set_uniform('u_canvas_size', 'vec2', [trans.width, trans.height]);
    this.prog.set_uniform('u_offset', 'vec2', [trans.dx - baked_offset[0], trans.dy - baked_offset[1]]);
    this.prog.set_uniform('u_scale', 'vec2', [trans.sx, trans.sy]);
    this.prog.set_attribute('a_x', 'float', mainGlGlyph.vbo_x);
    this.prog.set_attribute('a_y', 'float', mainGlGlyph.vbo_y);
    this.prog.set_attribute('a_size', 'float', mainGlGlyph.vbo_s);
    this.prog.set_attribute('a_angle', 'float', mainGlGlyph.vbo_a);
    if (indices.length === 0) {

    } else if (indices.length === nvertices) {
      return this.prog.draw(this.gl.POINTS, [0, nvertices]);
    } else if (nvertices < 65535) {
      ua = window.navigator.userAgent;
      if (ua.indexOf("MSIE ") + ua.indexOf("Trident/") + ua.indexOf("Edge/") > 0) {
        logger.warn('WebGL warning: IE is known to produce 1px sprites whith selections.');
      }
      this.index_buffer.set_size(indices.length * 2);
      this.index_buffer.set_data(0, new Uint16Array(indices));
      return this.prog.draw(this.gl.POINTS, this.index_buffer);
    } else {
      chunksize = 64000;
      chunks = [];
      for (i = j = 0, ref1 = Math.ceil(nvertices / chunksize); 0 <= ref1 ? j < ref1 : j > ref1; i = 0 <= ref1 ? ++j : --j) {
        chunks.push([]);
      }
      for (i = k = 0, ref2 = indices.length; 0 <= ref2 ? k < ref2 : k > ref2; i = 0 <= ref2 ? ++k : --k) {
        uint16_index = indices[i] % chunksize;
        chunk = Math.floor(indices[i] / chunksize);
        chunks[chunk].push(uint16_index);
      }
      results = [];
      for (chunk = l = 0, ref3 = chunks.length; 0 <= ref3 ? l < ref3 : l > ref3; chunk = 0 <= ref3 ? ++l : --l) {
        these_indices = new Uint16Array(chunks[chunk]);
        offset = chunk * chunksize * 4;
        if (these_indices.length === 0) {
          continue;
        }
        this.prog.set_attribute('a_x', 'float', mainGlGlyph.vbo_x, 0, offset);
        this.prog.set_attribute('a_y', 'float', mainGlGlyph.vbo_y, 0, offset);
        this.prog.set_attribute('a_size', 'float', mainGlGlyph.vbo_s, 0, offset);
        this.prog.set_attribute('a_angle', 'float', mainGlGlyph.vbo_a, 0, offset);
        if (this.vbo_linewidth.used) {
          this.prog.set_attribute('a_linewidth', 'float', this.vbo_linewidth, 0, offset);
        }
        if (this.vbo_fg_color.used) {
          this.prog.set_attribute('a_fg_color', 'vec4', this.vbo_fg_color, 0, offset * 4);
        }
        if (this.vbo_bg_color.used) {
          this.prog.set_attribute('a_bg_color', 'vec4', this.vbo_bg_color, 0, offset * 4);
        }
        this.index_buffer.set_size(these_indices.length * 2);
        this.index_buffer.set_data(0, these_indices);
        results.push(this.prog.draw(this.gl.POINTS, this.index_buffer));
      }
      return results;
    }
  };

  MarkerGLGlyph.prototype._set_data = function(nvertices) {
    var i, j, n, ref1, s, xx, yy;
    n = nvertices * 4;
    this.vbo_x.set_size(n);
    this.vbo_y.set_size(n);
    this.vbo_a.set_size(n);
    this.vbo_s.set_size(n);
    xx = new Float64Array(this.glyph._x);
    yy = new Float64Array(this.glyph._y);
    for (i = j = 0, ref1 = nvertices; 0 <= ref1 ? j < ref1 : j > ref1; i = 0 <= ref1 ? ++j : --j) {
      xx[i] += this._baked_offset[0];
      yy[i] += this._baked_offset[1];
    }
    this.vbo_x.set_data(0, new Float32Array(xx));
    this.vbo_y.set_data(0, new Float32Array(yy));
    if (this.glyph._angle != null) {
      this.vbo_a.set_data(0, new Float32Array(this.glyph._angle));
    }
    if (this.glyph._radius != null) {
      return this.vbo_s.set_data(0, new Float32Array((function() {
        var k, len, ref2, results;
        ref2 = this.glyph.sradius;
        results = [];
        for (k = 0, len = ref2.length; k < len; k++) {
          s = ref2[k];
          results.push(s * 2);
        }
        return results;
      }).call(this)));
    } else {
      return this.vbo_s.set_data(0, new Float32Array(this.glyph._size));
    }
  };

  MarkerGLGlyph.prototype._set_visuals = function(nvertices) {
    attach_float(this.prog, this.vbo_linewidth, 'a_linewidth', nvertices, this.glyph.visuals.line, 'line_width');
    attach_color(this.prog, this.vbo_fg_color, 'a_fg_color', nvertices, this.glyph.visuals.line, 'line');
    attach_color(this.prog, this.vbo_bg_color, 'a_bg_color', nvertices, this.glyph.visuals.fill, 'fill');
    return this.prog.set_uniform('u_antialias', 'float', [0.8]);
  };

  return MarkerGLGlyph;

})(BaseGLGlyph);

CircleGLGlyph = (function(superClass) {
  extend(CircleGLGlyph, superClass);

  function CircleGLGlyph() {
    return CircleGLGlyph.__super__.constructor.apply(this, arguments);
  }

  CircleGLGlyph.prototype.GLYPH = 'circle';

  CircleGLGlyph.prototype.MARKERCODE = "// --- disc\nfloat marker(vec2 P, float size)\n{\n    return length(P) - size/2.0;\n}";

  return CircleGLGlyph;

})(MarkerGLGlyph);

SquareGLGlyph = (function(superClass) {
  extend(SquareGLGlyph, superClass);

  function SquareGLGlyph() {
    return SquareGLGlyph.__super__.constructor.apply(this, arguments);
  }

  SquareGLGlyph.prototype.GLYPH = 'square';

  SquareGLGlyph.prototype.MARKERCODE = "// --- square\nfloat marker(vec2 P, float size)\n{\n    return max(abs(P.x), abs(P.y)) - size/2.0;\n}";

  return SquareGLGlyph;

})(MarkerGLGlyph);

AnnulusGLGlyph = (function(superClass) {
  extend(AnnulusGLGlyph, superClass);

  function AnnulusGLGlyph() {
    return AnnulusGLGlyph.__super__.constructor.apply(this, arguments);
  }

  AnnulusGLGlyph.prototype.GLYPH = 'annulus';

  AnnulusGLGlyph.prototype.MARKERCODE = "float marker(vec2 P, float size)\n{\n    float r1 = length(P) - size/2.0;\n    float r2 = length(P) - size/4.0;  // half width\n    return max(r1, -r2);\n}";

  return AnnulusGLGlyph;

})(MarkerGLGlyph);

DiamondGLGlyph = (function(superClass) {
  extend(DiamondGLGlyph, superClass);

  function DiamondGLGlyph() {
    return DiamondGLGlyph.__super__.constructor.apply(this, arguments);
  }

  DiamondGLGlyph.prototype.GLYPH = 'diamond';

  DiamondGLGlyph.prototype.MARKERCODE = "// --- diamond\nfloat marker(vec2 P, float size)\n{\n    float x = SQRT_2 / 2.0 * (P.x * 1.5 - P.y);\n    float y = SQRT_2 / 2.0 * (P.x * 1.5 + P.y);\n    float r1 = max(abs(x), abs(y)) - size / (2.0 * SQRT_2);\n    return r1 / SQRT_2;\n}";

  return DiamondGLGlyph;

})(MarkerGLGlyph);

TriangleGLGlyph = (function(superClass) {
  extend(TriangleGLGlyph, superClass);

  function TriangleGLGlyph() {
    return TriangleGLGlyph.__super__.constructor.apply(this, arguments);
  }

  TriangleGLGlyph.prototype.GLYPH = 'triangle';

  TriangleGLGlyph.prototype.MARKERCODE = "float marker(vec2 P, float size)\n{\n    P.y -= size * 0.3;\n    float x = SQRT_2 / 2.0 * (P.x * 1.7 - P.y);\n    float y = SQRT_2 / 2.0 * (P.x * 1.7 + P.y);\n    float r1 = max(abs(x), abs(y)) - size / 1.6;\n    float r2 = P.y;\n    return max(r1 / SQRT_2, r2);  // Instersect diamond with rectangle\n}";

  return TriangleGLGlyph;

})(MarkerGLGlyph);

InvertedTriangleGLGlyph = (function(superClass) {
  extend(InvertedTriangleGLGlyph, superClass);

  function InvertedTriangleGLGlyph() {
    return InvertedTriangleGLGlyph.__super__.constructor.apply(this, arguments);
  }

  InvertedTriangleGLGlyph.prototype.GLYPH = 'invertedtriangle';

  InvertedTriangleGLGlyph.prototype.MARKERCODE = "float marker(vec2 P, float size)\n{\n    P.y += size * 0.3;\n    float x = SQRT_2 / 2.0 * (P.x * 1.7 - P.y);\n    float y = SQRT_2 / 2.0 * (P.x * 1.7 + P.y);\n    float r1 = max(abs(x), abs(y)) - size / 1.6;\n    float r2 = - P.y;\n    return max(r1 / SQRT_2, r2);  // Instersect diamond with rectangle\n}";

  return InvertedTriangleGLGlyph;

})(MarkerGLGlyph);

CrossGLGlyph = (function(superClass) {
  extend(CrossGLGlyph, superClass);

  function CrossGLGlyph() {
    return CrossGLGlyph.__super__.constructor.apply(this, arguments);
  }

  CrossGLGlyph.prototype.GLYPH = 'cross';

  CrossGLGlyph.prototype.MARKERCODE = "float marker(vec2 P, float size)\n{\n    float square = max(abs(P.x), abs(P.y)) - size / 2.5;  // 2.5 is a tweak\n    float cross = min(abs(P.x), abs(P.y)) - size / 100.0;  // bit of \"width\" for aa\n    return max(square, cross);\n}";

  return CrossGLGlyph;

})(MarkerGLGlyph);

CircleCrossGLGlyph = (function(superClass) {
  extend(CircleCrossGLGlyph, superClass);

  function CircleCrossGLGlyph() {
    return CircleCrossGLGlyph.__super__.constructor.apply(this, arguments);
  }

  CircleCrossGLGlyph.prototype.GLYPH = 'circlecross';

  CircleCrossGLGlyph.prototype.MARKERCODE = "float marker(vec2 P, float size)\n{\n    // Define quadrants\n    float qs = size / 2.0;  // quadrant size\n    float s1 = max(abs(P.x - qs), abs(P.y - qs)) - qs;\n    float s2 = max(abs(P.x + qs), abs(P.y - qs)) - qs;\n    float s3 = max(abs(P.x - qs), abs(P.y + qs)) - qs;\n    float s4 = max(abs(P.x + qs), abs(P.y + qs)) - qs;\n    // Intersect main shape with quadrants (to form cross)\n    float circle = length(P) - size/2.0;\n    float c1 = max(circle, s1);\n    float c2 = max(circle, s2);\n    float c3 = max(circle, s3);\n    float c4 = max(circle, s4);\n    // Union\n    return min(min(min(c1, c2), c3), c4);\n}";

  return CircleCrossGLGlyph;

})(MarkerGLGlyph);

SquareCrossGLGlyph = (function(superClass) {
  extend(SquareCrossGLGlyph, superClass);

  function SquareCrossGLGlyph() {
    return SquareCrossGLGlyph.__super__.constructor.apply(this, arguments);
  }

  SquareCrossGLGlyph.prototype.GLYPH = 'squarecross';

  SquareCrossGLGlyph.prototype.MARKERCODE = "float marker(vec2 P, float size)\n{\n    // Define quadrants\n    float qs = size / 2.0;  // quadrant size\n    float s1 = max(abs(P.x - qs), abs(P.y - qs)) - qs;\n    float s2 = max(abs(P.x + qs), abs(P.y - qs)) - qs;\n    float s3 = max(abs(P.x - qs), abs(P.y + qs)) - qs;\n    float s4 = max(abs(P.x + qs), abs(P.y + qs)) - qs;\n    // Intersect main shape with quadrants (to form cross)\n    float square = max(abs(P.x), abs(P.y)) - size/2.0;\n    float c1 = max(square, s1);\n    float c2 = max(square, s2);\n    float c3 = max(square, s3);\n    float c4 = max(square, s4);\n    // Union\n    return min(min(min(c1, c2), c3), c4);\n}";

  return SquareCrossGLGlyph;

})(MarkerGLGlyph);

DiamondCrossGLGlyph = (function(superClass) {
  extend(DiamondCrossGLGlyph, superClass);

  function DiamondCrossGLGlyph() {
    return DiamondCrossGLGlyph.__super__.constructor.apply(this, arguments);
  }

  DiamondCrossGLGlyph.prototype.GLYPH = 'diamondcross';

  DiamondCrossGLGlyph.prototype.MARKERCODE = "float marker(vec2 P, float size)\n{\n    // Define quadrants\n    float qs = size / 2.0;  // quadrant size\n    float s1 = max(abs(P.x - qs), abs(P.y - qs)) - qs;\n    float s2 = max(abs(P.x + qs), abs(P.y - qs)) - qs;\n    float s3 = max(abs(P.x - qs), abs(P.y + qs)) - qs;\n    float s4 = max(abs(P.x + qs), abs(P.y + qs)) - qs;\n    // Intersect main shape with quadrants (to form cross)\n    float x = SQRT_2 / 2.0 * (P.x * 1.5 - P.y);\n    float y = SQRT_2 / 2.0 * (P.x * 1.5 + P.y);\n    float diamond = max(abs(x), abs(y)) - size / (2.0 * SQRT_2);\n    diamond /= SQRT_2;\n    float c1 = max(diamond, s1);\n    float c2 = max(diamond, s2);\n    float c3 = max(diamond, s3);\n    float c4 = max(diamond, s4);\n    // Union\n    return min(min(min(c1, c2), c3), c4);\n}";

  return DiamondCrossGLGlyph;

})(MarkerGLGlyph);

XGLGlyph = (function(superClass) {
  extend(XGLGlyph, superClass);

  function XGLGlyph() {
    return XGLGlyph.__super__.constructor.apply(this, arguments);
  }

  XGLGlyph.prototype.GLYPH = 'x';

  XGLGlyph.prototype.MARKERCODE = "float marker(vec2 P, float size)\n{\n    float circle = length(P) - size / 1.6;\n    float X = min(abs(P.x - P.y), abs(P.x + P.y)) - size / 100.0;  // bit of \"width\" for aa\n    return max(circle, X);\n}";

  return XGLGlyph;

})(MarkerGLGlyph);

CircleXGLGlyph = (function(superClass) {
  extend(CircleXGLGlyph, superClass);

  function CircleXGLGlyph() {
    return CircleXGLGlyph.__super__.constructor.apply(this, arguments);
  }

  CircleXGLGlyph.prototype.GLYPH = 'circlex';

  CircleXGLGlyph.prototype.MARKERCODE = "float marker(vec2 P, float size)\n{\n    float x = P.x - P.y;\n    float y = P.x + P.y;\n    // Define quadrants\n    float qs = size / 2.0;  // quadrant size\n    float s1 = max(abs(x - qs), abs(y - qs)) - qs;\n    float s2 = max(abs(x + qs), abs(y - qs)) - qs;\n    float s3 = max(abs(x - qs), abs(y + qs)) - qs;\n    float s4 = max(abs(x + qs), abs(y + qs)) - qs;\n    // Intersect main shape with quadrants (to form cross)\n    float circle = length(P) - size/2.0;\n    float c1 = max(circle, s1);\n    float c2 = max(circle, s2);\n    float c3 = max(circle, s3);\n    float c4 = max(circle, s4);\n    // Union\n    float almost = min(min(min(c1, c2), c3), c4);\n    // In this case, the X is also outside of the main shape\n    float Xmask = length(P) - size / 1.6;  // a circle\n    float X = min(abs(P.x - P.y), abs(P.x + P.y)) - size / 100.0;  // bit of \"width\" for aa\n    return min(max(X, Xmask), almost);\n}";

  return CircleXGLGlyph;

})(MarkerGLGlyph);

SquareXGLGlyph = (function(superClass) {
  extend(SquareXGLGlyph, superClass);

  function SquareXGLGlyph() {
    return SquareXGLGlyph.__super__.constructor.apply(this, arguments);
  }

  SquareXGLGlyph.prototype.GLYPH = 'squarex';

  SquareXGLGlyph.prototype.MARKERCODE = "float marker(vec2 P, float size)\n{\n    float x = P.x - P.y;\n    float y = P.x + P.y;\n    // Define quadrants\n    float qs = size / 2.0;  // quadrant size\n    float s1 = max(abs(x - qs), abs(y - qs)) - qs;\n    float s2 = max(abs(x + qs), abs(y - qs)) - qs;\n    float s3 = max(abs(x - qs), abs(y + qs)) - qs;\n    float s4 = max(abs(x + qs), abs(y + qs)) - qs;\n    // Intersect main shape with quadrants (to form cross)\n    float square = max(abs(P.x), abs(P.y)) - size/2.0;\n    float c1 = max(square, s1);\n    float c2 = max(square, s2);\n    float c3 = max(square, s3);\n    float c4 = max(square, s4);\n    // Union\n    return min(min(min(c1, c2), c3), c4);\n}";

  return SquareXGLGlyph;

})(MarkerGLGlyph);

AsteriskGLGlyph = (function(superClass) {
  extend(AsteriskGLGlyph, superClass);

  function AsteriskGLGlyph() {
    return AsteriskGLGlyph.__super__.constructor.apply(this, arguments);
  }

  AsteriskGLGlyph.prototype.GLYPH = 'asterisk';

  AsteriskGLGlyph.prototype.MARKERCODE = "float marker(vec2 P, float size)\n{\n    // Masks\n    float diamond = max(abs(SQRT_2 / 2.0 * (P.x - P.y)), abs(SQRT_2 / 2.0 * (P.x + P.y))) - size / (2.0 * SQRT_2);\n    float square = max(abs(P.x), abs(P.y)) - size / (2.0 * SQRT_2);\n    // Shapes\n    float X = min(abs(P.x - P.y), abs(P.x + P.y)) - size / 100.0;  // bit of \"width\" for aa\n    float cross = min(abs(P.x), abs(P.y)) - size / 100.0;  // bit of \"width\" for aa\n    // Result is union of masked shapes\n    return min(max(X, diamond), max(cross, square));\n}";

  return AsteriskGLGlyph;

})(MarkerGLGlyph);

module.exports = {
  CircleGLGlyph: CircleGLGlyph,
  SquareGLGlyph: SquareGLGlyph,
  AnnulusGLGlyph: AnnulusGLGlyph,
  DiamondGLGlyph: DiamondGLGlyph,
  TriangleGLGlyph: TriangleGLGlyph,
  InvertedTriangleGLGlyph: InvertedTriangleGLGlyph,
  CrossGLGlyph: CrossGLGlyph,
  CircleCrossGLGlyph: CircleCrossGLGlyph,
  SquareCrossGLGlyph: SquareCrossGLGlyph,
  DiamondCrossGLGlyph: DiamondCrossGLGlyph,
  XGLGlyph: XGLGlyph,
  CircleXGLGlyph: CircleXGLGlyph,
  SquareXGLGlyph: SquareXGLGlyph,
  AsteriskGLGlyph: AsteriskGLGlyph
};
