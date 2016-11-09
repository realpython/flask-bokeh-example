var Arc, ArcView, Glyph, _, p,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

Glyph = require("./glyph");

p = require("../../core/properties");

ArcView = (function(superClass) {
  extend(ArcView, superClass);

  function ArcView() {
    return ArcView.__super__.constructor.apply(this, arguments);
  }

  ArcView.prototype._index_data = function() {
    return this._xy_index();
  };

  ArcView.prototype._map_data = function() {
    if (this.model.properties.radius.units === "data") {
      return this.sradius = this.sdist(this.renderer.xmapper, this._x, this._radius);
    } else {
      return this.sradius = this._radius;
    }
  };

  ArcView.prototype._render = function(ctx, indices, arg) {
    var _end_angle, _start_angle, direction, i, j, len, results, sradius, sx, sy;
    sx = arg.sx, sy = arg.sy, sradius = arg.sradius, _start_angle = arg._start_angle, _end_angle = arg._end_angle;
    if (this.visuals.line.doit) {
      direction = this.model.properties.direction.value();
      results = [];
      for (j = 0, len = indices.length; j < len; j++) {
        i = indices[j];
        if (isNaN(sx[i] + sy[i] + sradius[i] + _start_angle[i] + _end_angle[i])) {
          continue;
        }
        ctx.beginPath();
        ctx.arc(sx[i], sy[i], sradius[i], _start_angle[i], _end_angle[i], direction);
        this.visuals.line.set_vectorize(ctx, i);
        results.push(ctx.stroke());
      }
      return results;
    }
  };

  ArcView.prototype.draw_legend_for_index = function(ctx, x0, x1, y0, y1, index) {
    return this._generic_line_legend(ctx, x0, x1, y0, y1, index);
  };

  return ArcView;

})(Glyph.View);

Arc = (function(superClass) {
  extend(Arc, superClass);

  function Arc() {
    return Arc.__super__.constructor.apply(this, arguments);
  }

  Arc.prototype.default_view = ArcView;

  Arc.prototype.type = 'Arc';

  Arc.coords([['x', 'y']]);

  Arc.mixins(['line']);

  Arc.define({
    direction: [p.Direction, 'anticlock'],
    radius: [p.DistanceSpec],
    start_angle: [p.AngleSpec],
    end_angle: [p.AngleSpec]
  });

  return Arc;

})(Glyph.Model);

module.exports = {
  Model: Arc,
  View: ArcView
};
