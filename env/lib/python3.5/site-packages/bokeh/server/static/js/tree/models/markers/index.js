var M, SQ3, _one_cross, _one_diamond, _one_tri, _one_x, asterisk, circle_cross, circle_x, cross, diamond, diamond_cross, generate_marker, inverted_triangle, square, square_cross, square_x, triangle, x,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

M = require("./marker");

SQ3 = Math.sqrt(3);

generate_marker = function(type, f) {
  var Model, View;
  View = (function(superClass) {
    extend(View, superClass);

    function View() {
      return View.__super__.constructor.apply(this, arguments);
    }

    View.prototype._render_one = f;

    return View;

  })(M.View);
  Model = (function(superClass) {
    extend(Model, superClass);

    function Model() {
      return Model.__super__.constructor.apply(this, arguments);
    }

    Model.prototype.default_view = View;

    Model.prototype.type = type;

    return Model;

  })(M.Model);
  return {
    Model: Model,
    View: View
  };
};

_one_x = function(ctx, r) {
  ctx.moveTo(-r, r);
  ctx.lineTo(r, -r);
  ctx.moveTo(-r, -r);
  return ctx.lineTo(r, r);
};

_one_cross = function(ctx, r) {
  ctx.moveTo(0, r);
  ctx.lineTo(0, -r);
  ctx.moveTo(-r, 0);
  return ctx.lineTo(r, 0);
};

_one_diamond = function(ctx, r) {
  ctx.moveTo(0, r);
  ctx.lineTo(r / 1.5, 0);
  ctx.lineTo(0, -r);
  ctx.lineTo(-r / 1.5, 0);
  return ctx.closePath();
};

_one_tri = function(ctx, r) {
  var a, h;
  h = r * SQ3;
  a = h / 3;
  ctx.moveTo(-r, a);
  ctx.lineTo(r, a);
  ctx.lineTo(0, a - h);
  return ctx.closePath();
};

asterisk = function(ctx, i, sx, sy, r, line, fill) {
  var r2;
  r2 = r * 0.65;
  _one_cross(ctx, r);
  _one_x(ctx, r2);
  if (line.doit) {
    line.set_vectorize(ctx, i);
    ctx.stroke();
  }
};

circle_cross = function(ctx, i, sx, sy, r, line, fill) {
  ctx.arc(0, 0, r, 0, 2 * Math.PI, false);
  if (fill.doit) {
    fill.set_vectorize(ctx, i);
    ctx.fill();
  }
  if (line.doit) {
    line.set_vectorize(ctx, i);
    _one_cross(ctx, r);
    ctx.stroke();
  }
};

circle_x = function(ctx, i, sx, sy, r, line, fill) {
  ctx.arc(0, 0, r, 0, 2 * Math.PI, false);
  if (fill.doit) {
    fill.set_vectorize(ctx, i);
    ctx.fill();
  }
  if (line.doit) {
    line.set_vectorize(ctx, i);
    _one_x(ctx, r);
    ctx.stroke();
  }
};

cross = function(ctx, i, sx, sy, r, line, fill) {
  _one_cross(ctx, r);
  if (line.doit) {
    line.set_vectorize(ctx, i);
    ctx.stroke();
  }
};

diamond = function(ctx, i, sx, sy, r, line, fill) {
  _one_diamond(ctx, r);
  if (fill.doit) {
    fill.set_vectorize(ctx, i);
    ctx.fill();
  }
  if (line.doit) {
    line.set_vectorize(ctx, i);
    ctx.stroke();
  }
};

diamond_cross = function(ctx, i, sx, sy, r, line, fill) {
  _one_diamond(ctx, r);
  if (fill.doit) {
    fill.set_vectorize(ctx, i);
    ctx.fill();
  }
  if (line.doit) {
    line.set_vectorize(ctx, i);
    _one_cross(ctx, r);
    ctx.stroke();
  }
};

inverted_triangle = function(ctx, i, sx, sy, r, line, fill) {
  ctx.rotate(Math.PI);
  _one_tri(ctx, r);
  ctx.rotate(-Math.PI);
  if (fill.doit) {
    fill.set_vectorize(ctx, i);
    ctx.fill();
  }
  if (line.doit) {
    line.set_vectorize(ctx, i);
    ctx.stroke();
  }
};

square = function(ctx, i, sx, sy, r, line, fill) {
  var size;
  size = 2 * r;
  ctx.rect(-r, -r, size, size);
  if (fill.doit) {
    fill.set_vectorize(ctx, i);
    ctx.fill();
  }
  if (line.doit) {
    line.set_vectorize(ctx, i);
    ctx.stroke();
  }
};

square_cross = function(ctx, i, sx, sy, r, line, fill) {
  var size;
  size = 2 * r;
  ctx.rect(-r, -r, size, size);
  if (fill.doit) {
    fill.set_vectorize(ctx, i);
    ctx.fill();
  }
  if (line.doit) {
    line.set_vectorize(ctx, i);
    _one_cross(ctx, r);
    ctx.stroke();
  }
};

square_x = function(ctx, i, sx, sy, r, line, fill) {
  var size;
  size = 2 * r;
  ctx.rect(-r, -r, size, size);
  if (fill.doit) {
    fill.set_vectorize(ctx, i);
    ctx.fill();
  }
  if (line.doit) {
    line.set_vectorize(ctx, i);
    _one_x(ctx, r);
    ctx.stroke();
  }
};

triangle = function(ctx, i, sx, sy, r, line, fill) {
  _one_tri(ctx, r);
  if (fill.doit) {
    fill.set_vectorize(ctx, i);
    ctx.fill();
  }
  if (line.doit) {
    line.set_vectorize(ctx, i);
    ctx.stroke();
  }
};

x = function(ctx, i, sx, sy, r, line, fill) {
  _one_x(ctx, r);
  if (line.doit) {
    line.set_vectorize(ctx, i);
    ctx.stroke();
  }
};

module.exports = {
  Asterisk: generate_marker('Asterisk', asterisk),
  CircleCross: generate_marker('CircleCross', circle_cross),
  CircleX: generate_marker('CircleX', circle_x),
  Cross: generate_marker('Cross', cross),
  Diamond: generate_marker('Diamond', diamond),
  DiamondCross: generate_marker('DiamondCross', diamond_cross),
  InvertedTriangle: generate_marker('InvertedTriangle', inverted_triangle),
  Square: generate_marker('Square', square),
  SquareCross: generate_marker('SquareCross', square_cross),
  SquareX: generate_marker('SquareX', square_x),
  Triangle: generate_marker('Triangle', triangle),
  X: generate_marker('X', x)
};
