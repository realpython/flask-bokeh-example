var Glyph, Patch, PatchView, _,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

Glyph = require("./glyph");

PatchView = (function(superClass) {
  extend(PatchView, superClass);

  function PatchView() {
    return PatchView.__super__.constructor.apply(this, arguments);
  }

  PatchView.prototype._index_data = function() {
    return this._xy_index();
  };

  PatchView.prototype._render = function(ctx, indices, arg) {
    var i, j, k, len, len1, sx, sy;
    sx = arg.sx, sy = arg.sy;
    if (this.visuals.fill.doit) {
      this.visuals.fill.set_value(ctx);
      for (j = 0, len = indices.length; j < len; j++) {
        i = indices[j];
        if (i === 0) {
          ctx.beginPath();
          ctx.moveTo(sx[i], sy[i]);
          continue;
        } else if (isNaN(sx[i] + sy[i])) {
          ctx.closePath();
          ctx.fill();
          ctx.beginPath();
          continue;
        } else {
          ctx.lineTo(sx[i], sy[i]);
        }
      }
      ctx.closePath();
      ctx.fill();
    }
    if (this.visuals.line.doit) {
      this.visuals.line.set_value(ctx);
      for (k = 0, len1 = indices.length; k < len1; k++) {
        i = indices[k];
        if (i === 0) {
          ctx.beginPath();
          ctx.moveTo(sx[i], sy[i]);
          continue;
        } else if (isNaN(sx[i] + sy[i])) {
          ctx.closePath();
          ctx.stroke();
          ctx.beginPath();
          continue;
        } else {
          ctx.lineTo(sx[i], sy[i]);
        }
      }
      ctx.closePath();
      return ctx.stroke();
    }
  };

  PatchView.prototype.draw_legend_for_index = function(ctx, x0, x1, y0, y1, index) {
    return this._generic_area_legend(ctx, x0, x1, y0, y1, index);
  };

  return PatchView;

})(Glyph.View);

Patch = (function(superClass) {
  extend(Patch, superClass);

  function Patch() {
    return Patch.__super__.constructor.apply(this, arguments);
  }

  Patch.prototype.default_view = PatchView;

  Patch.prototype.type = 'Patch';

  Patch.coords([['x', 'y']]);

  Patch.mixins(['line', 'fill']);

  return Patch;

})(Glyph.Model);

module.exports = {
  Model: Patch,
  View: PatchView
};
