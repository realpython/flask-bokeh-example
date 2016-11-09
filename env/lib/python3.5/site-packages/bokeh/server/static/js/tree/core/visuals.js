var ContextProperties, Fill, Line, Text, Visuals, _, color2rgba, mixins,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

mixins = require("./property_mixins");

color2rgba = require("./util/color").color2rgba;

ContextProperties = (function() {
  function ContextProperties(obj, prefix) {
    var attr, do_spec, j, len, ref;
    if (prefix == null) {
      prefix = "";
    }
    this.obj = obj;
    this.prefix = prefix;
    this.cache = {};
    do_spec = obj.properties[prefix + this.do_attr].spec;
    this.doit = !_.isNull(do_spec.value);
    ref = this.attrs;
    for (j = 0, len = ref.length; j < len; j++) {
      attr = ref[j];
      this[attr] = obj.properties[prefix + attr];
    }
  }

  ContextProperties.prototype.warm_cache = function(source) {
    var attr, j, len, prop, ref, results;
    ref = this.attrs;
    results = [];
    for (j = 0, len = ref.length; j < len; j++) {
      attr = ref[j];
      prop = this.obj.properties[this.prefix + attr];
      if (!_.isUndefined(prop.spec.value)) {
        results.push(this.cache[attr] = prop.spec.value);
      } else {
        results.push(this.cache[attr + "_array"] = prop.array(source));
      }
    }
    return results;
  };

  ContextProperties.prototype.cache_select = function(attr, i) {
    var prop;
    prop = this.obj.properties[this.prefix + attr];
    if (!_.isUndefined(prop.spec.value)) {
      return this.cache[attr] = prop.spec.value;
    } else {
      return this.cache[attr] = this.cache[attr + "_array"][i];
    }
  };

  return ContextProperties;

})();

Line = (function(superClass) {
  extend(Line, superClass);

  function Line() {
    return Line.__super__.constructor.apply(this, arguments);
  }

  Line.prototype.attrs = _.keys(mixins.line());

  Line.prototype.do_attr = "line_color";

  Line.prototype.set_value = function(ctx) {
    ctx.strokeStyle = this.line_color.value();
    ctx.globalAlpha = this.line_alpha.value();
    ctx.lineWidth = this.line_width.value();
    ctx.lineJoin = this.line_join.value();
    ctx.lineCap = this.line_cap.value();
    ctx.setLineDash(this.line_dash.value());
    return ctx.setLineDashOffset(this.line_dash_offset.value());
  };

  Line.prototype.set_vectorize = function(ctx, i) {
    this.cache_select("line_color", i);
    if (ctx.strokeStyle !== this.cache.line_color) {
      ctx.strokeStyle = this.cache.line_color;
    }
    this.cache_select("line_alpha", i);
    if (ctx.globalAlpha !== this.cache.line_alpha) {
      ctx.globalAlpha = this.cache.line_alpha;
    }
    this.cache_select("line_width", i);
    if (ctx.lineWidth !== this.cache.line_width) {
      ctx.lineWidth = this.cache.line_width;
    }
    this.cache_select("line_join", i);
    if (ctx.lineJoin !== this.cache.line_join) {
      ctx.lineJoin = this.cache.line_join;
    }
    this.cache_select("line_cap", i);
    if (ctx.lineCap !== this.cache.line_cap) {
      ctx.lineCap = this.cache.line_cap;
    }
    this.cache_select("line_dash", i);
    if (ctx.getLineDash() !== this.cache.line_dash) {
      ctx.setLineDash(this.cache.line_dash);
    }
    this.cache_select("line_dash_offset", i);
    if (ctx.getLineDashOffset() !== this.cache.line_dash_offset) {
      return ctx.setLineDashOffset(this.cache.line_dash_offset);
    }
  };

  Line.prototype.color_value = function() {
    var color;
    color = color2rgba(this.line_color.value(), this.line_alpha.value());
    return "rgba(" + (color[0] * 255) + "," + (color[1] * 255) + "," + (color[2] * 255) + "," + color[3] + ")";
  };

  return Line;

})(ContextProperties);

Fill = (function(superClass) {
  extend(Fill, superClass);

  function Fill() {
    return Fill.__super__.constructor.apply(this, arguments);
  }

  Fill.prototype.attrs = _.keys(mixins.fill());

  Fill.prototype.do_attr = "fill_color";

  Fill.prototype.set_value = function(ctx) {
    ctx.fillStyle = this.fill_color.value();
    return ctx.globalAlpha = this.fill_alpha.value();
  };

  Fill.prototype.set_vectorize = function(ctx, i) {
    this.cache_select("fill_color", i);
    if (ctx.fillStyle !== this.cache.fill_color) {
      ctx.fillStyle = this.cache.fill_color;
    }
    this.cache_select("fill_alpha", i);
    if (ctx.globalAlpha !== this.cache.fill_alpha) {
      return ctx.globalAlpha = this.cache.fill_alpha;
    }
  };

  Fill.prototype.color_value = function() {
    var color;
    color = color2rgba(this.fill_color.value(), this.fill_alpha.value());
    return "rgba(" + (color[0] * 255) + "," + (color[1] * 255) + "," + (color[2] * 255) + "," + color[3] + ")";
  };

  return Fill;

})(ContextProperties);

Text = (function(superClass) {
  extend(Text, superClass);

  function Text() {
    return Text.__super__.constructor.apply(this, arguments);
  }

  Text.prototype.attrs = _.keys(mixins.text());

  Text.prototype.do_attr = "text_color";

  Text.prototype.cache_select = function(name, i) {
    var val;
    if (name === "font") {
      val = Text.__super__.cache_select.call(this, "text_font_style", i) + " " + Text.__super__.cache_select.call(this, "text_font_size", i) + " " + Text.__super__.cache_select.call(this, "text_font", i);
      return this.cache.font = val;
    } else {
      return Text.__super__.cache_select.call(this, name, i);
    }
  };

  Text.prototype.font_value = function() {
    var font, font_size, font_style;
    font = this.text_font.value();
    font_size = this.text_font_size.value();
    font_style = this.text_font_style.value();
    return font_style + " " + font_size + " " + font;
  };

  Text.prototype.color_value = function() {
    var color;
    color = color2rgba(this.text_color.value(), this.text_alpha.value());
    return "rgba(" + (color[0] * 255) + "," + (color[1] * 255) + "," + (color[2] * 255) + "," + color[3] + ")";
  };

  Text.prototype.set_value = function(ctx) {
    ctx.font = this.font_value();
    ctx.fillStyle = this.text_color.value();
    ctx.globalAlpha = this.text_alpha.value();
    ctx.textAlign = this.text_align.value();
    return ctx.textBaseline = this.text_baseline.value();
  };

  Text.prototype.set_vectorize = function(ctx, i) {
    this.cache_select("font", i);
    if (ctx.font !== this.cache.font) {
      ctx.font = this.cache.font;
    }
    this.cache_select("text_color", i);
    if (ctx.fillStyle !== this.cache.text_color) {
      ctx.fillStyle = this.cache.text_color;
    }
    this.cache_select("text_alpha", i);
    if (ctx.globalAlpha !== this.cache.text_alpha) {
      ctx.globalAlpha = this.cache.text_alpha;
    }
    this.cache_select("text_align", i);
    if (ctx.textAlign !== this.cache.text_align) {
      ctx.textAlign = this.cache.text_align;
    }
    this.cache_select("text_baseline", i);
    if (ctx.textBaseline !== this.cache.text_baseline) {
      return ctx.textBaseline = this.cache.text_baseline;
    }
  };

  return Text;

})(ContextProperties);

Visuals = (function() {
  function Visuals(model) {
    var cls, j, len, name, prefix, ref, ref1, ref2, spec;
    ref = model.mixins;
    for (j = 0, len = ref.length; j < len; j++) {
      spec = ref[j];
      ref1 = spec.split(":"), name = ref1[0], prefix = (ref2 = ref1[1]) != null ? ref2 : "";
      cls = (function() {
        switch (name) {
          case "line":
            return Line;
          case "fill":
            return Fill;
          case "text":
            return Text;
        }
      })();
      this[prefix + name] = new cls(model, prefix);
    }
  }

  Visuals.prototype.warm_cache = function(source) {
    var name, prop, ref, results;
    ref = this;
    results = [];
    for (name in ref) {
      if (!hasProp.call(ref, name)) continue;
      prop = ref[name];
      if (prop instanceof ContextProperties) {
        results.push(prop.warm_cache(source));
      } else {
        results.push(void 0);
      }
    }
    return results;
  };

  return Visuals;

})();

module.exports = {
  Visuals: Visuals,
  Line: Line,
  Fill: Fill,
  Text: Text
};
