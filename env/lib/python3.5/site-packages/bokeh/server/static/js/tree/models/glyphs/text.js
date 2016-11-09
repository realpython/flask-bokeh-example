var Glyph, Text, TextView, _, p,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

Glyph = require("./glyph");

p = require("../../core/properties");

TextView = (function(superClass) {
  extend(TextView, superClass);

  function TextView() {
    return TextView.__super__.constructor.apply(this, arguments);
  }

  TextView.prototype._index_data = function() {
    return this._xy_index();
  };

  TextView.prototype._render = function(ctx, indices, arg) {
    var _angle, _text, _x_offset, _y_offset, i, j, len, results, sx, sy;
    sx = arg.sx, sy = arg.sy, _x_offset = arg._x_offset, _y_offset = arg._y_offset, _angle = arg._angle, _text = arg._text;
    results = [];
    for (j = 0, len = indices.length; j < len; j++) {
      i = indices[j];
      if (isNaN(sx[i] + sy[i] + _x_offset[i] + _y_offset[i] + _angle[i]) || (_text[i] == null)) {
        continue;
      }
      if (this.visuals.text.doit) {
        ctx.save();
        ctx.translate(sx[i] + _x_offset[i], sy[i] + _y_offset[i]);
        ctx.rotate(_angle[i]);
        this.visuals.text.set_vectorize(ctx, i);
        ctx.fillText(_text[i], 0, 0);
        results.push(ctx.restore());
      } else {
        results.push(void 0);
      }
    }
    return results;
  };

  TextView.prototype.draw_legend_for_index = function(ctx, x0, x1, y0, y1, index) {
    ctx.save();
    this.text_props.set_value(ctx);
    ctx.font = this.text_props.font_value();
    ctx.font = ctx.font.replace(/\b[\d\.]+[\w]+\b/, '10pt');
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillText("text", x2, (y1 + y2) / 2);
    return ctx.restore();
  };

  return TextView;

})(Glyph.View);

Text = (function(superClass) {
  extend(Text, superClass);

  function Text() {
    return Text.__super__.constructor.apply(this, arguments);
  }

  Text.prototype.default_view = TextView;

  Text.prototype.type = 'Text';

  Text.coords([['x', 'y']]);

  Text.mixins(['text']);

  Text.define({
    text: [
      p.StringSpec, {
        field: "text"
      }
    ],
    angle: [p.AngleSpec, 0],
    x_offset: [p.NumberSpec, 0],
    y_offset: [p.NumberSpec, 0]
  });

  return Text;

})(Glyph.Model);

module.exports = {
  Model: Text,
  View: TextView
};
