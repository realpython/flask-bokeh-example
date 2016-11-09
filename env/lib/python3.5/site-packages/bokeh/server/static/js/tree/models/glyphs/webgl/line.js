var BaseGLGlyph, DashAtlas, LineGLGlyph, attach_color, attach_float, color2rgba, gloo2, line_width, logger, ref,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

gloo2 = require("gloo2");

logger = require("../../../core/logging").logger;

ref = require("./base"), BaseGLGlyph = ref.BaseGLGlyph, line_width = ref.line_width, attach_float = ref.attach_float, attach_color = ref.attach_color, color2rgba = ref.color2rgba;

DashAtlas = (function() {
  function DashAtlas(gl) {
    this._atlas = {};
    this._index = 0;
    this._width = 256;
    this._height = 256;
    this.tex = new gloo2.Texture2D(gl);
    this.tex.set_wrapping(gl.REPEAT, gl.REPEAT);
    this.tex.set_interpolation(gl.NEAREST, gl.NEAREST);
    this.tex.set_size([this._height, this._width], gl.RGBA);
    this.tex.set_data([0, 0], [this._height, this._width], new Uint8Array(this._height * this._width * 4));
    this.get_atlas_data([1]);
  }

  DashAtlas.prototype.get_atlas_data = function(pattern) {
    var data, findex_period, key, period, ref1, x;
    key = pattern.join('-');
    findex_period = this._atlas[key];
    if (findex_period === void 0) {
      ref1 = this.make_pattern(pattern), data = ref1[0], period = ref1[1];
      this.tex.set_data([this._index, 0], [1, this._width], new Uint8Array((function() {
        var l, len, results;
        results = [];
        for (l = 0, len = data.length; l < len; l++) {
          x = data[l];
          results.push(x + 10);
        }
        return results;
      })()));
      this._atlas[key] = [this._index / this._height, period];
      this._index += 1;
    }
    return this._atlas[key];
  };

  DashAtlas.prototype.make_pattern = function(pattern) {
    var C, Z, a, b, c, dash_end, dash_start, dash_type, i, index, j, l, len, n, p, period, q, r, ref1, ref2, ref3, v, val, val_at_index, x;
    if (pattern.length > 1 && pattern.length % 2) {
      pattern = pattern.concat(pattern);
    }
    period = 0;
    for (l = 0, len = pattern.length; l < len; l++) {
      v = pattern[l];
      period += v;
    }
    C = [];
    c = 0;
    for (i = p = 0, ref1 = pattern.length + 2; p < ref1; i = p += 2) {
      a = Math.max(0.0001, pattern[i % pattern.length]);
      b = Math.max(0.0001, pattern[(i + 1) % pattern.length]);
      C.push.apply(C, [c, c + a]);
      c += a + b;
    }
    n = this._width;
    Z = new Float32Array(n * 4);
    for (i = q = 0, ref2 = n; 0 <= ref2 ? q < ref2 : q > ref2; i = 0 <= ref2 ? ++q : --q) {
      x = period * i / (n - 1);
      index = 0;
      val_at_index = 1e16;
      for (j = r = 0, ref3 = C.length; 0 <= ref3 ? r < ref3 : r > ref3; j = 0 <= ref3 ? ++r : --r) {
        val = Math.abs(C[j] - x);
        if (val < val_at_index) {
          index = j;
          val_at_index = val;
        }
      }
      if (index % 2 === 0) {
        dash_type = x <= C[index] ? +1 : 0;
        dash_start = C[index];
        dash_end = C[index + 1];
      } else {
        dash_type = x > C[index] ? -1 : 0;
        dash_start = C[index - 1];
        dash_end = C[index];
      }
      Z[i * 4 + 0] = C[index];
      Z[i * 4 + 1] = dash_type;
      Z[i * 4 + 2] = dash_start;
      Z[i * 4 + 3] = dash_end;
    }
    return [Z, period];
  };

  return DashAtlas;

})();

LineGLGlyph = (function(superClass) {
  extend(LineGLGlyph, superClass);

  function LineGLGlyph() {
    return LineGLGlyph.__super__.constructor.apply(this, arguments);
  }

  LineGLGlyph.prototype.GLYPH = 'line';

  LineGLGlyph.prototype.JOINS = {
    'miter': 0,
    'round': 1,
    'bevel': 2
  };

  LineGLGlyph.prototype.CAPS = {
    '': 0,
    'none': 0,
    '.': 0,
    'round': 1,
    ')': 1,
    '(': 1,
    'o': 1,
    'triangle in': 2,
    '<': 2,
    'triangle out': 3,
    '>': 3,
    'square': 4,
    '[': 4,
    ']': 4,
    '=': 4,
    'butt': 5,
    '|': 5
  };

  LineGLGlyph.prototype.VERT = "precision mediump float;\n\nconst float PI = 3.14159265358979323846264;\nconst float THETA = 15.0 * 3.14159265358979323846264/180.0;\n\nuniform float u_pixel_ratio;\nuniform vec2 u_canvas_size, u_offset;\nuniform vec2 u_scale_aspect;\nuniform float u_scale_length;\n\nuniform vec4 u_color;\nuniform float u_antialias;\nuniform float u_length;\nuniform float u_linewidth;\nuniform float u_dash_index;\nuniform float u_closed;\n\nattribute vec2 a_position;\nattribute vec4 a_tangents;\nattribute vec2 a_segment;\nattribute vec2 a_angles;\nattribute vec2 a_texcoord;\n\nvarying vec4  v_color;\nvarying vec2  v_segment;\nvarying vec2  v_angles;\nvarying vec2  v_texcoord;\nvarying vec2  v_miter;\nvarying float v_length;\nvarying float v_linewidth;\n\nfloat cross(in vec2 v1, in vec2 v2)\n{\n    return v1.x*v2.y - v1.y*v2.x;\n}\n\nfloat signed_distance(in vec2 v1, in vec2 v2, in vec2 v3)\n{\n    return cross(v2-v1,v1-v3) / length(v2-v1);\n}\n\nvoid rotate( in vec2 v, in float alpha, out vec2 result )\n{\n    float c = cos(alpha);\n    float s = sin(alpha);\n    result = vec2( c*v.x - s*v.y,\n                   s*v.x + c*v.y );\n}\n\nvoid main()\n{\n    bool closed = (u_closed > 0.0);\n\n    // Attributes and uniforms to varyings\n    v_color = u_color;\n    v_linewidth = u_linewidth;\n    v_segment = a_segment * u_scale_length;\n    v_length = u_length * u_scale_length;\n\n    // Scale to map to pixel coordinates. The original algorithm from the paper\n    // assumed isotropic scale. We obviously do not have this.\n    vec2 abs_scale_aspect = abs(u_scale_aspect);\n    vec2 abs_scale = u_scale_length * abs_scale_aspect;\n\n    // Correct angles for aspect ratio\n    vec2 av;\n    av = vec2(1.0, tan(a_angles.x)) / abs_scale_aspect;\n    v_angles.x = atan(av.y, av.x);\n    av = vec2(1.0, tan(a_angles.y)) / abs_scale_aspect;\n    v_angles.y = atan(av.y, av.x);\n\n    // Thickness below 1 pixel are represented using a 1 pixel thickness\n    // and a modified alpha\n    v_color.a = min(v_linewidth, v_color.a);\n    v_linewidth = max(v_linewidth, 1.0);\n\n    // If color is fully transparent we just will discard the fragment anyway\n    if( v_color.a <= 0.0 ) {\n        gl_Position = vec4(0.0,0.0,0.0,1.0);\n        return;\n    }\n\n    // This is the actual half width of the line\n    float w = ceil(u_antialias+v_linewidth)/2.0;\n\n    vec2 position = (a_position + u_offset) * abs_scale;\n\n    vec2 t1 = normalize(a_tangents.xy * abs_scale_aspect);  // note the scaling for aspect ratio here\n    vec2 t2 = normalize(a_tangents.zw * abs_scale_aspect);\n    float u = a_texcoord.x;\n    float v = a_texcoord.y;\n    vec2 o1 = vec2( +t1.y, -t1.x);\n    vec2 o2 = vec2( +t2.y, -t2.x);\n\n    // This is a join\n    // ----------------------------------------------------------------\n    if( t1 != t2 ) {\n        float angle = atan (t1.x*t2.y-t1.y*t2.x, t1.x*t2.x+t1.y*t2.y);  // Angle needs recalculation for some reason\n        vec2 t  = normalize(t1+t2);\n        vec2 o  = vec2( + t.y, - t.x);\n\n        if ( u_dash_index > 0.0 )\n        {\n            // Broken angle\n            // ----------------------------------------------------------------\n            if( (abs(angle) > THETA) ) {\n                position += v * w * o / cos(angle/2.0);\n                float s = sign(angle);\n                if( angle < 0.0 ) {\n                    if( u == +1.0 ) {\n                        u = v_segment.y + v * w * tan(angle/2.0);\n                        if( v == 1.0 ) {\n                            position -= 2.0 * w * t1 / sin(angle);\n                            u -= 2.0 * w / sin(angle);\n                        }\n                    } else {\n                        u = v_segment.x - v * w * tan(angle/2.0);\n                        if( v == 1.0 ) {\n                            position += 2.0 * w * t2 / sin(angle);\n                            u += 2.0*w / sin(angle);\n                        }\n                    }\n                } else {\n                    if( u == +1.0 ) {\n                        u = v_segment.y + v * w * tan(angle/2.0);\n                        if( v == -1.0 ) {\n                            position += 2.0 * w * t1 / sin(angle);\n                            u += 2.0 * w / sin(angle);\n                        }\n                    } else {\n                        u = v_segment.x - v * w * tan(angle/2.0);\n                        if( v == -1.0 ) {\n                            position -= 2.0 * w * t2 / sin(angle);\n                            u -= 2.0*w / sin(angle);\n                        }\n                    }\n                }\n                // Continuous angle\n                // ------------------------------------------------------------\n            } else {\n                position += v * w * o / cos(angle/2.0);\n                if( u == +1.0 ) u = v_segment.y;\n                else            u = v_segment.x;\n            }\n        }\n\n        // Solid line\n        // --------------------------------------------------------------------\n        else\n        {\n            position.xy += v * w * o / cos(angle/2.0);\n            if( angle < 0.0 ) {\n                if( u == +1.0 ) {\n                    u = v_segment.y + v * w * tan(angle/2.0);\n                } else {\n                    u = v_segment.x - v * w * tan(angle/2.0);\n                }\n            } else {\n                if( u == +1.0 ) {\n                    u = v_segment.y + v * w * tan(angle/2.0);\n                } else {\n                    u = v_segment.x - v * w * tan(angle/2.0);\n                }\n            }\n        }\n\n    // This is a line start or end (t1 == t2)\n    // ------------------------------------------------------------------------\n    } else {\n        position += v * w * o1;\n        if( u == -1.0 ) {\n            u = v_segment.x - w;\n            position -= w * t1;\n        } else {\n            u = v_segment.y + w;\n            position += w * t2;\n        }\n    }\n\n    // Miter distance\n    // ------------------------------------------------------------------------\n    vec2 t;\n    vec2 curr = a_position * abs_scale;\n    if( a_texcoord.x < 0.0 ) {\n        vec2 next = curr + t2*(v_segment.y-v_segment.x);\n\n        rotate( t1, +v_angles.x/2.0, t);\n        v_miter.x = signed_distance(curr, curr+t, position);\n\n        rotate( t2, +v_angles.y/2.0, t);\n        v_miter.y = signed_distance(next, next+t, position);\n    } else {\n        vec2 prev = curr - t1*(v_segment.y-v_segment.x);\n\n        rotate( t1, -v_angles.x/2.0,t);\n        v_miter.x = signed_distance(prev, prev+t, position);\n\n        rotate( t2, -v_angles.y/2.0,t);\n        v_miter.y = signed_distance(curr, curr+t, position);\n    }\n\n    if (!closed && v_segment.x <= 0.0) {\n        v_miter.x = 1e10;\n    }\n    if (!closed && v_segment.y >= v_length)\n    {\n        v_miter.y = 1e10;\n    }\n\n    v_texcoord = vec2( u, v*w );\n\n    // Calculate position in device coordinates. Note that we\n    // already scaled with abs scale above.\n    vec2 normpos = position * sign(u_scale_aspect);\n    normpos += 0.5;  // make up for Bokeh's offset\n    normpos /= u_canvas_size / u_pixel_ratio;  // in 0..1\n    gl_Position = vec4(normpos*2.0-1.0, 0.0, 1.0);\n    gl_Position.y *= -1.0;\n}\n";

  LineGLGlyph.prototype.FRAG_ = "// Fragment shader that can be convenient during debugging to show the line skeleton.\nprecision mediump float;\nuniform vec4  u_color;\nvoid main () {\n  gl_FragColor = u_color;\n}";

  LineGLGlyph.prototype.FRAG = "precision mediump float;\n\nconst float PI = 3.14159265358979323846264;\nconst float THETA = 15.0 * 3.14159265358979323846264/180.0;\n\nuniform sampler2D u_dash_atlas;\n\nuniform vec2 u_linecaps;\nuniform float u_miter_limit;\nuniform float u_linejoin;\nuniform float u_antialias;\nuniform float u_dash_phase;\nuniform float u_dash_period;\nuniform float u_dash_index;\nuniform vec2 u_dash_caps;\nuniform float u_closed;\n\nvarying vec4  v_color;\nvarying vec2  v_segment;\nvarying vec2  v_angles;\nvarying vec2  v_texcoord;\nvarying vec2  v_miter;\nvarying float v_length;\nvarying float v_linewidth;\n\n// Compute distance to cap ----------------------------------------------------\nfloat cap( int type, float dx, float dy, float t, float linewidth )\n{\n    float d = 0.0;\n    dx = abs(dx);\n    dy = abs(dy);\n    if      (type == 0)  discard;  // None\n    else if (type == 1)  d = sqrt(dx*dx+dy*dy);  // Round\n    else if (type == 3)  d = (dx+abs(dy));  // Triangle in\n    else if (type == 2)  d = max(abs(dy),(t+dx-abs(dy)));  // Triangle out\n    else if (type == 4)  d = max(dx,dy);  // Square\n    else if (type == 5)  d = max(dx+t,dy);  // Butt\n    return d;\n}\n\n// Compute distance to join -------------------------------------------------\nfloat join( in int type, in float d, in vec2 segment, in vec2 texcoord, in vec2 miter,\n           in float linewidth )\n{\n    // texcoord.x is distance from start\n    // texcoord.y is distance from centerline\n    // segment.x and y indicate the limits (as for texcoord.x) for this segment\n\n    float dx = texcoord.x;\n\n    // Round join\n    if( type == 1 ) {\n        if (dx < segment.x) {\n            d = max(d,length( texcoord - vec2(segment.x,0.0)));\n            //d = length( texcoord - vec2(segment.x,0.0));\n        } else if (dx > segment.y) {\n            d = max(d,length( texcoord - vec2(segment.y,0.0)));\n            //d = length( texcoord - vec2(segment.y,0.0));\n        }\n    }\n    // Bevel join\n    else if ( type == 2 ) {\n        if (dx < segment.x) {\n            vec2 x = texcoord - vec2(segment.x,0.0);\n            d = max(d, max(abs(x.x), abs(x.y)));\n\n        } else if (dx > segment.y) {\n            vec2 x = texcoord - vec2(segment.y,0.0);\n            d = max(d, max(abs(x.x), abs(x.y)));\n        }\n        /*  Original code for bevel which does not work for us\n        if( (dx < segment.x) ||  (dx > segment.y) )\n            d = max(d, min(abs(x.x),abs(x.y)));\n        */\n    }\n\n    return d;\n}\n\nvoid main()\n{\n    // If color is fully transparent we just discard the fragment\n    if( v_color.a <= 0.0 ) {\n        discard;\n    }\n\n    // Test if dash pattern is the solid one (0)\n    bool solid =  (u_dash_index == 0.0);\n\n    // Test if path is closed\n    bool closed = (u_closed > 0.0);\n\n    vec4 color = v_color;\n    float dx = v_texcoord.x;\n    float dy = v_texcoord.y;\n    float t = v_linewidth/2.0-u_antialias;\n    float width = 1.0;  //v_linewidth; original code had dashes scale with line width, we do not\n    float d = 0.0;\n\n    vec2 linecaps = u_linecaps;\n    vec2 dash_caps = u_dash_caps;\n    float line_start = 0.0;\n    float line_stop = v_length;\n\n    // Apply miter limit; fragments too far into the miter are simply discarded\n    if( (dx < v_segment.x) || (dx > v_segment.y) ) {\n        float into_miter = max(v_segment.x - dx, dx - v_segment.y);\n        if (into_miter > u_miter_limit*v_linewidth/2.0)\n          discard;\n    }\n\n    // Solid line --------------------------------------------------------------\n    if( solid ) {\n        d = abs(dy);\n        if( (!closed) && (dx < line_start) ) {\n            d = cap( int(u_linecaps.x), abs(dx), abs(dy), t, v_linewidth );\n        }\n        else if( (!closed) &&  (dx > line_stop) ) {\n            d = cap( int(u_linecaps.y), abs(dx)-line_stop, abs(dy), t, v_linewidth );\n        }\n        else {\n            d = join( int(u_linejoin), abs(dy), v_segment, v_texcoord, v_miter, v_linewidth );\n        }\n\n    // Dash line --------------------------------------------------------------\n    } else {\n        float segment_start = v_segment.x;\n        float segment_stop  = v_segment.y;\n        float segment_center= (segment_start+segment_stop)/2.0;\n        float freq          = u_dash_period*width;\n        float u = mod( dx + u_dash_phase*width, freq);\n        vec4 tex = texture2D(u_dash_atlas, vec2(u/freq, u_dash_index)) * 255.0 -10.0;  // conversion to int-like\n        float dash_center= tex.x * width;\n        float dash_type  = tex.y;\n        float _start = tex.z * width;\n        float _stop  = tex.a * width;\n        float dash_start = dx - u + _start;\n        float dash_stop  = dx - u + _stop;\n\n        // Compute extents of the first dash (the one relative to v_segment.x)\n        // Note: this could be computed in the vertex shader\n        if( (dash_stop < segment_start) && (dash_caps.x != 5.0) ) {\n            float u = mod(segment_start + u_dash_phase*width, freq);\n            vec4 tex = texture2D(u_dash_atlas, vec2(u/freq, u_dash_index)) * 255.0 -10.0;  // conversion to int-like\n            dash_center= tex.x * width;\n            //dash_type  = tex.y;\n            float _start = tex.z * width;\n            float _stop  = tex.a * width;\n            dash_start = segment_start - u + _start;\n            dash_stop = segment_start - u + _stop;\n        }\n\n        // Compute extents of the last dash (the one relatives to v_segment.y)\n        // Note: This could be computed in the vertex shader\n        else if( (dash_start > segment_stop)  && (dash_caps.y != 5.0) ) {\n            float u = mod(segment_stop + u_dash_phase*width, freq);\n            vec4 tex = texture2D(u_dash_atlas, vec2(u/freq, u_dash_index)) * 255.0 -10.0;  // conversion to int-like\n            dash_center= tex.x * width;\n            //dash_type  = tex.y;\n            float _start = tex.z * width;\n            float _stop  = tex.a * width;\n            dash_start = segment_stop - u + _start;\n            dash_stop  = segment_stop - u + _stop;\n        }\n\n        // This test if the we are dealing with a discontinuous angle\n        bool discontinuous = ((dx <  segment_center) && abs(v_angles.x) > THETA) ||\n                             ((dx >= segment_center) && abs(v_angles.y) > THETA);\n        //if( dx < line_start) discontinuous = false;\n        //if( dx > line_stop)  discontinuous = false;\n\n        float d_join = join( int(u_linejoin), abs(dy),\n                            v_segment, v_texcoord, v_miter, v_linewidth );\n\n        // When path is closed, we do not have room for linecaps, so we make room\n        // by shortening the total length\n        if (closed) {\n             line_start += v_linewidth/2.0;\n             line_stop  -= v_linewidth/2.0;\n        }\n\n        // We also need to take antialias area into account\n        //line_start += u_antialias;\n        //line_stop  -= u_antialias;\n\n        // Check is dash stop is before line start\n        if( dash_stop <= line_start ) {\n            discard;\n        }\n        // Check is dash start is beyond line stop\n        if( dash_start >= line_stop ) {\n            discard;\n        }\n\n        // Check if current dash start is beyond segment stop\n        if( discontinuous ) {\n            // Dash start is beyond segment, we discard\n            if( (dash_start > segment_stop) ) {\n                discard;\n                //gl_FragColor = vec4(1.0,0.0,0.0,.25); return;\n            }\n\n            // Dash stop is before segment, we discard\n            if( (dash_stop < segment_start) ) {\n                discard;  //gl_FragColor = vec4(0.0,1.0,0.0,.25); return;\n            }\n\n            // Special case for round caps (nicer with this)\n            if( dash_caps.x == 1.0 ) {\n                if( (u > _stop) && (dash_stop > segment_stop )  && (abs(v_angles.y) < PI/2.0)) {\n                    discard;\n                }\n            }\n\n            // Special case for round caps  (nicer with this)\n            if( dash_caps.y == 1.0 ) {\n                if( (u < _start) && (dash_start < segment_start )  && (abs(v_angles.x) < PI/2.0)) {\n                    discard;\n                }\n            }\n\n            // Special case for triangle caps (in & out) and square\n            // We make sure the cap stop at crossing frontier\n            if( (dash_caps.x != 1.0) && (dash_caps.x != 5.0) ) {\n                if( (dash_start < segment_start )  && (abs(v_angles.x) < PI/2.0) ) {\n                    float a = v_angles.x/2.0;\n                    float x = (segment_start-dx)*cos(a) - dy*sin(a);\n                    float y = (segment_start-dx)*sin(a) + dy*cos(a);\n                    if( x > 0.0 ) discard;\n                    // We transform the cap into square to avoid holes\n                    dash_caps.x = 4.0;\n                }\n            }\n\n            // Special case for triangle caps (in & out) and square\n            // We make sure the cap stop at crossing frontier\n            if( (dash_caps.y != 1.0) && (dash_caps.y != 5.0) ) {\n                if( (dash_stop > segment_stop )  && (abs(v_angles.y) < PI/2.0) ) {\n                    float a = v_angles.y/2.0;\n                    float x = (dx-segment_stop)*cos(a) - dy*sin(a);\n                    float y = (dx-segment_stop)*sin(a) + dy*cos(a);\n                    if( x > 0.0 ) discard;\n                    // We transform the caps into square to avoid holes\n                    dash_caps.y = 4.0;\n                }\n            }\n        }\n\n        // Line cap at start\n        if( (dx < line_start) && (dash_start < line_start) && (dash_stop > line_start) ) {\n            d = cap( int(linecaps.x), dx-line_start, dy, t, v_linewidth);\n        }\n        // Line cap at stop\n        else if( (dx > line_stop) && (dash_stop > line_stop) && (dash_start < line_stop) ) {\n            d = cap( int(linecaps.y), dx-line_stop, dy, t, v_linewidth);\n        }\n        // Dash cap left - dash_type = -1, 0 or 1, but there may be roundoff errors\n        else if( dash_type < -0.5 ) {\n            d = cap( int(dash_caps.y), abs(u-dash_center), dy, t, v_linewidth);\n            if( (dx > line_start) && (dx < line_stop) )\n                d = max(d,d_join);\n        }\n        // Dash cap right\n        else if( dash_type > 0.5 ) {\n            d = cap( int(dash_caps.x), abs(dash_center-u), dy, t, v_linewidth);\n            if( (dx > line_start) && (dx < line_stop) )\n                d = max(d,d_join);\n        }\n        // Dash body (plain)\n        else {// if( dash_type > -0.5 &&  dash_type < 0.5) {\n            d = abs(dy);\n        }\n\n        // Line join\n        if( (dx > line_start) && (dx < line_stop)) {\n            if( (dx <= segment_start) && (dash_start <= segment_start)\n                && (dash_stop >= segment_start) ) {\n                d = d_join;\n                // Antialias at outer border\n                float angle = PI/2.+v_angles.x;\n                float f = abs( (segment_start - dx)*cos(angle) - dy*sin(angle));\n                d = max(f,d);\n            }\n            else if( (dx > segment_stop) && (dash_start <= segment_stop)\n                     && (dash_stop >= segment_stop) ) {\n                d = d_join;\n                // Antialias at outer border\n                float angle = PI/2.+v_angles.y;\n                float f = abs((dx - segment_stop)*cos(angle) - dy*sin(angle));\n                d = max(f,d);\n            }\n            else if( dx < (segment_start - v_linewidth/2.)) {\n                discard;\n            }\n            else if( dx > (segment_stop + v_linewidth/2.)) {\n                discard;\n            }\n        }\n        else if( dx < (segment_start - v_linewidth/2.)) {\n            discard;\n        }\n        else if( dx > (segment_stop + v_linewidth/2.)) {\n            discard;\n        }\n    }\n\n    // Distance to border ------------------------------------------------------\n    d = d - t;\n    if( d < 0.0 ) {\n        gl_FragColor = color;\n    } else {\n        d /= u_antialias;\n        gl_FragColor = vec4(color.rgb, exp(-d*d)*color.a);\n    }\n}";

  LineGLGlyph.prototype.init = function() {
    var gl;
    gl = this.gl;
    this._scale_aspect = 0;
    this.prog = new gloo2.Program(gl);
    this.prog.set_shaders(this.VERT, this.FRAG);
    this.index_buffer = new gloo2.IndexBuffer(gl);
    this.vbo_position = new gloo2.VertexBuffer(gl);
    this.vbo_tangents = new gloo2.VertexBuffer(gl);
    this.vbo_segment = new gloo2.VertexBuffer(gl);
    this.vbo_angles = new gloo2.VertexBuffer(gl);
    this.vbo_texcoord = new gloo2.VertexBuffer(gl);
    return this.dash_atlas = new DashAtlas(gl);
  };

  LineGLGlyph.prototype.draw = function(indices, mainGlyph, trans) {
    var baked_offset, chunk, chunks, chunksize, i, l, mainGlGlyph, nvertices, offset, p, q, ref1, ref2, ref3, results, scale_length, sx, sy, these_indices, uint16_index;
    mainGlGlyph = mainGlyph.glglyph;
    if (mainGlGlyph.data_changed) {
      if (!(isFinite(trans.dx) && isFinite(trans.dy))) {
        return;
      }
      mainGlGlyph._baked_offset = [trans.dx, trans.dy];
      mainGlGlyph._set_data();
      mainGlGlyph.data_changed = false;
    }
    if (this.visuals_changed) {
      this._set_visuals();
      this.visuals_changed = false;
    }
    sx = trans.sx;
    sy = trans.sy;
    scale_length = Math.sqrt(sx * sx + sy * sy);
    sx /= scale_length;
    sy /= scale_length;
    if (Math.abs(this._scale_aspect - (sy / sx)) > Math.abs(1e-3 * this._scale_aspect)) {
      mainGlGlyph._update_scale(sx, sy);
      this._scale_aspect = sy / sx;
    }
    this.prog.set_attribute('a_position', 'vec2', mainGlGlyph.vbo_position);
    this.prog.set_attribute('a_tangents', 'vec4', mainGlGlyph.vbo_tangents);
    this.prog.set_attribute('a_segment', 'vec2', mainGlGlyph.vbo_segment);
    this.prog.set_attribute('a_angles', 'vec2', mainGlGlyph.vbo_angles);
    this.prog.set_attribute('a_texcoord', 'vec2', mainGlGlyph.vbo_texcoord);
    this.prog.set_uniform('u_length', 'float', [mainGlGlyph.cumsum]);
    this.prog.set_texture('u_dash_atlas', this.dash_atlas.tex);
    baked_offset = mainGlGlyph._baked_offset;
    this.prog.set_uniform('u_pixel_ratio', 'float', [trans.pixel_ratio]);
    this.prog.set_uniform('u_canvas_size', 'vec2', [trans.width, trans.height]);
    this.prog.set_uniform('u_offset', 'vec2', [trans.dx - baked_offset[0], trans.dy - baked_offset[1]]);
    this.prog.set_uniform('u_scale_aspect', 'vec2', [sx, sy]);
    this.prog.set_uniform('u_scale_length', 'float', [scale_length]);
    this.I_triangles = mainGlGlyph.I_triangles;
    if (this.I_triangles.length < 65535) {
      this.index_buffer.set_size(this.I_triangles.length * 2);
      this.index_buffer.set_data(0, new Uint16Array(this.I_triangles));
      return this.prog.draw(this.gl.TRIANGLES, this.index_buffer);
    } else {
      indices = this.I_triangles;
      nvertices = this.I_triangles.length;
      chunksize = 64008;
      chunks = [];
      for (i = l = 0, ref1 = Math.ceil(nvertices / chunksize); 0 <= ref1 ? l < ref1 : l > ref1; i = 0 <= ref1 ? ++l : --l) {
        chunks.push([]);
      }
      for (i = p = 0, ref2 = indices.length; 0 <= ref2 ? p < ref2 : p > ref2; i = 0 <= ref2 ? ++p : --p) {
        uint16_index = indices[i] % chunksize;
        chunk = Math.floor(indices[i] / chunksize);
        chunks[chunk].push(uint16_index);
      }
      results = [];
      for (chunk = q = 0, ref3 = chunks.length; 0 <= ref3 ? q < ref3 : q > ref3; chunk = 0 <= ref3 ? ++q : --q) {
        these_indices = new Uint16Array(chunks[chunk]);
        offset = chunk * chunksize * 4;
        if (these_indices.length === 0) {
          continue;
        }
        this.prog.set_attribute('a_position', 'vec2', mainGlGlyph.vbo_position, 0, offset * 2);
        this.prog.set_attribute('a_tangents', 'vec4', mainGlGlyph.vbo_tangents, 0, offset * 4);
        this.prog.set_attribute('a_segment', 'vec2', mainGlGlyph.vbo_segment, 0, offset * 2);
        this.prog.set_attribute('a_angles', 'vec2', mainGlGlyph.vbo_angles, 0, offset * 2);
        this.prog.set_attribute('a_texcoord', 'vec2', mainGlGlyph.vbo_texcoord, 0, offset * 2);
        this.index_buffer.set_size(these_indices.length * 2);
        this.index_buffer.set_data(0, these_indices);
        results.push(this.prog.draw(this.gl.TRIANGLES, this.index_buffer));
      }
      return results;
    }
  };

  LineGLGlyph.prototype._set_data = function() {
    this._bake();
    this.vbo_position.set_size(this.V_position.length * 4);
    this.vbo_position.set_data(0, this.V_position);
    this.vbo_tangents.set_size(this.V_tangents.length * 4);
    this.vbo_tangents.set_data(0, this.V_tangents);
    this.vbo_angles.set_size(this.V_angles.length * 4);
    this.vbo_angles.set_data(0, this.V_angles);
    this.vbo_texcoord.set_size(this.V_texcoord.length * 4);
    return this.vbo_texcoord.set_data(0, this.V_texcoord);
  };

  LineGLGlyph.prototype._set_visuals = function() {
    var cap, color, dash_index, dash_pattern, dash_period, join, ref1;
    color = color2rgba(this.glyph.visuals.line.line_color.value(), this.glyph.visuals.line.line_alpha.value());
    cap = this.CAPS[this.glyph.visuals.line.line_cap.value()];
    join = this.JOINS[this.glyph.visuals.line.line_join.value()];
    this.prog.set_uniform('u_color', 'vec4', color);
    this.prog.set_uniform('u_linewidth', 'float', [this.glyph.visuals.line.line_width.value()]);
    this.prog.set_uniform('u_antialias', 'float', [0.9]);
    this.prog.set_uniform('u_linecaps', 'vec2', [cap, cap]);
    this.prog.set_uniform('u_linejoin', 'float', [join]);
    this.prog.set_uniform('u_miter_limit', 'float', [10.0]);
    dash_pattern = this.glyph.visuals.line.line_dash.value();
    dash_index = 0;
    dash_period = 1;
    if (dash_pattern.length) {
      ref1 = this.dash_atlas.get_atlas_data(dash_pattern), dash_index = ref1[0], dash_period = ref1[1];
    }
    this.prog.set_uniform('u_dash_index', 'float', [dash_index]);
    this.prog.set_uniform('u_dash_phase', 'float', [this.glyph.visuals.line.line_dash_offset.value()]);
    this.prog.set_uniform('u_dash_period', 'float', [dash_period]);
    this.prog.set_uniform('u_dash_caps', 'vec2', [cap, cap]);
    return this.prog.set_uniform('u_closed', 'float', [0]);
  };

  LineGLGlyph.prototype._bake = function() {
    var A, I, T, V_angles, V_angles2, V_position, V_position2, V_tangents, V_tangents2, V_texcoord, V_texcoord2, Vp, Vt, _x, _y, i, i1, j, k, l, m, n, ni, o, p, q, r, ref1, ref2, ref3, ref4, ref5, ref6, ref7, ref8, results, s, t, u, w, y, z;
    n = this.nvertices;
    _x = new Float64Array(this.glyph._x);
    _y = new Float64Array(this.glyph._y);
    V_position = Vp = new Float32Array(n * 2);
    V_angles = new Float32Array(n * 2);
    V_tangents = Vt = new Float32Array(n * 4);
    V_texcoord = new Float32Array(n * 2);
    for (i = l = 0, ref1 = n; 0 <= ref1 ? l < ref1 : l > ref1; i = 0 <= ref1 ? ++l : --l) {
      V_position[i * 2 + 0] = _x[i] + this._baked_offset[0];
      V_position[i * 2 + 1] = _y[i] + this._baked_offset[1];
    }
    this.tangents = T = new Float32Array(n * 2 - 2);
    for (i = p = 0, ref2 = n - 1; 0 <= ref2 ? p < ref2 : p > ref2; i = 0 <= ref2 ? ++p : --p) {
      T[i * 2 + 0] = Vp[(i + 1) * 2 + 0] - Vp[i * 2 + 0];
      T[i * 2 + 1] = Vp[(i + 1) * 2 + 1] - Vp[i * 2 + 1];
    }
    for (i = q = 0, ref3 = n - 1; 0 <= ref3 ? q < ref3 : q > ref3; i = 0 <= ref3 ? ++q : --q) {
      V_tangents[(i + 1) * 4 + 0] = T[i * 2 + 0];
      V_tangents[(i + 1) * 4 + 1] = T[i * 2 + 1];
      V_tangents[i * 4 + 2] = T[i * 2 + 0];
      V_tangents[i * 4 + 3] = T[i * 2 + 1];
    }
    V_tangents[0 * 4 + 0] = T[0];
    V_tangents[0 * 4 + 1] = T[1];
    V_tangents[(n - 1) * 4 + 2] = T[(n - 2) * 2 + 0];
    V_tangents[(n - 1) * 4 + 3] = T[(n - 2) * 2 + 1];
    A = new Float32Array(n);
    for (i = r = 0, ref4 = n; 0 <= ref4 ? r < ref4 : r > ref4; i = 0 <= ref4 ? ++r : --r) {
      A[i] = Math.atan2(Vt[i * 4 + 0] * Vt[i * 4 + 3] - Vt[i * 4 + 1] * Vt[i * 4 + 2], Vt[i * 4 + 0] * Vt[i * 4 + 2] + Vt[i * 4 + 1] * Vt[i * 4 + 3]);
    }
    for (i = s = 0, ref5 = n - 1; 0 <= ref5 ? s < ref5 : s > ref5; i = 0 <= ref5 ? ++s : --s) {
      V_angles[i * 2 + 0] = A[i];
      V_angles[i * 2 + 1] = A[i + 1];
    }
    m = 4 * n - 4;
    this.V_position = V_position2 = new Float32Array(m * 2);
    this.V_angles = V_angles2 = new Float32Array(m * 2);
    this.V_tangents = V_tangents2 = new Float32Array(m * 4);
    this.V_texcoord = V_texcoord2 = new Float32Array(m * 2);
    o = 2;
    for (i = t = 0, ref6 = n; 0 <= ref6 ? t < ref6 : t > ref6; i = 0 <= ref6 ? ++t : --t) {
      for (j = u = 0; u < 4; j = ++u) {
        for (k = w = 0; w < 2; k = ++w) {
          V_position2[(i * 4 + j - o) * 2 + k] = V_position[i * 2 + k];
          V_angles2[(i * 4 + j) * 2 + k] = V_angles[i * 2 + k];
        }
        for (k = y = 0; y < 4; k = ++y) {
          V_tangents2[(i * 4 + j - o) * 4 + k] = V_tangents[i * 4 + k];
        }
      }
    }
    for (i = z = 0, ref7 = n; 0 <= ref7 ? z <= ref7 : z >= ref7; i = 0 <= ref7 ? ++z : --z) {
      V_texcoord2[(i * 4 + 0) * 2 + 0] = -1;
      V_texcoord2[(i * 4 + 1) * 2 + 0] = -1;
      V_texcoord2[(i * 4 + 2) * 2 + 0] = +1;
      V_texcoord2[(i * 4 + 3) * 2 + 0] = +1;
      V_texcoord2[(i * 4 + 0) * 2 + 1] = -1;
      V_texcoord2[(i * 4 + 1) * 2 + 1] = +1;
      V_texcoord2[(i * 4 + 2) * 2 + 1] = -1;
      V_texcoord2[(i * 4 + 3) * 2 + 1] = +1;
    }
    ni = (n - 1) * 6;
    this.I_triangles = I = new Uint32Array(ni);
    results = [];
    for (i = i1 = 0, ref8 = n; 0 <= ref8 ? i1 < ref8 : i1 > ref8; i = 0 <= ref8 ? ++i1 : --i1) {
      I[i * 6 + 0] = 0 + 4 * i;
      I[i * 6 + 1] = 1 + 4 * i;
      I[i * 6 + 2] = 3 + 4 * i;
      I[i * 6 + 3] = 2 + 4 * i;
      I[i * 6 + 4] = 0 + 4 * i;
      results.push(I[i * 6 + 5] = 3 + 4 * i);
    }
    return results;
  };

  LineGLGlyph.prototype._update_scale = function(sx, sy) {
    var N, T, V_segment, V_segment2, cumsum, i, j, k, l, m, n, p, q, r, ref1, ref2, ref3, s;
    n = this.nvertices;
    m = 4 * n - 4;
    T = this.tangents;
    N = new Float32Array(n - 1);
    V_segment = new Float32Array(n * 2);
    this.V_segment = V_segment2 = new Float32Array(m * 2);
    for (i = l = 0, ref1 = n - 1; 0 <= ref1 ? l < ref1 : l > ref1; i = 0 <= ref1 ? ++l : --l) {
      N[i] = Math.sqrt(Math.pow(T[i * 2 + 0] * sx, 2) + Math.pow(T[i * 2 + 1] * sy, 2));
    }
    cumsum = 0;
    for (i = p = 0, ref2 = n - 1; 0 <= ref2 ? p < ref2 : p > ref2; i = 0 <= ref2 ? ++p : --p) {
      cumsum += N[i];
      V_segment[(i + 1) * 2 + 0] = cumsum;
      V_segment[i * 2 + 1] = cumsum;
    }
    for (i = q = 0, ref3 = n; 0 <= ref3 ? q < ref3 : q > ref3; i = 0 <= ref3 ? ++q : --q) {
      for (j = r = 0; r < 4; j = ++r) {
        for (k = s = 0; s < 2; k = ++s) {
          V_segment2[(i * 4 + j) * 2 + k] = V_segment[i * 2 + k];
        }
      }
    }
    this.cumsum = cumsum;
    this.vbo_segment.set_size(this.V_segment.length * 4);
    return this.vbo_segment.set_data(0, this.V_segment);
  };

  return LineGLGlyph;

})(BaseGLGlyph);

module.exports = {
  LineGLGlyph: LineGLGlyph
};
