var ALPHABETIC, BOTTOM, CENTER, EQ, GE, HANGING, LEFT, LayoutCanvas, MIDDLE, RIGHT, SidePanel, TOP, _, _align_lookup, _align_lookup_negative, _align_lookup_positive, _angle_lookup, _baseline_lookup, logger, p, pi2, ref, update_constraints,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

ref = require("./solver"), EQ = ref.EQ, GE = ref.GE;

LayoutCanvas = require("./layout_canvas");

p = require("../../core/properties");

logger = require("../../core/logging").logger;

pi2 = Math.PI / 2;

ALPHABETIC = 'alphabetic';

TOP = 'top';

BOTTOM = 'bottom';

MIDDLE = 'middle';

HANGING = 'hanging';

LEFT = 'left';

RIGHT = 'right';

CENTER = 'center';

_angle_lookup = {
  above: {
    parallel: 0,
    normal: -pi2,
    horizontal: 0,
    vertical: -pi2
  },
  below: {
    parallel: 0,
    normal: pi2,
    horizontal: 0,
    vertical: pi2
  },
  left: {
    parallel: -pi2,
    normal: 0,
    horizontal: 0,
    vertical: -pi2
  },
  right: {
    parallel: pi2,
    normal: 0,
    horizontal: 0,
    vertical: pi2
  }
};

_baseline_lookup = {
  above: {
    justified: TOP,
    parallel: ALPHABETIC,
    normal: MIDDLE,
    horizontal: ALPHABETIC,
    vertical: MIDDLE
  },
  below: {
    justified: BOTTOM,
    parallel: HANGING,
    normal: MIDDLE,
    horizontal: HANGING,
    vertical: MIDDLE
  },
  left: {
    justified: TOP,
    parallel: ALPHABETIC,
    normal: MIDDLE,
    horizontal: MIDDLE,
    vertical: ALPHABETIC
  },
  right: {
    justified: TOP,
    parallel: ALPHABETIC,
    normal: MIDDLE,
    horizontal: MIDDLE,
    vertical: ALPHABETIC
  }
};

_align_lookup = {
  above: {
    justified: CENTER,
    parallel: CENTER,
    normal: LEFT,
    horizontal: CENTER,
    vertical: LEFT
  },
  below: {
    justified: CENTER,
    parallel: CENTER,
    normal: LEFT,
    horizontal: CENTER,
    vertical: RIGHT
  },
  left: {
    justified: CENTER,
    parallel: CENTER,
    normal: RIGHT,
    horizontal: RIGHT,
    vertical: CENTER
  },
  right: {
    justified: CENTER,
    parallel: CENTER,
    normal: LEFT,
    horizontal: LEFT,
    vertical: CENTER
  }
};

_align_lookup_negative = {
  above: RIGHT,
  below: LEFT,
  left: RIGHT,
  right: LEFT
};

_align_lookup_positive = {
  above: LEFT,
  below: RIGHT,
  left: RIGHT,
  right: LEFT
};

update_constraints = function(view) {
  var s, side, size, v;
  v = view;
  if (v.model.props.visible != null) {
    if (v.model.visible === false) {
      return;
    }
  }
  size = v._get_size();
  if (v._last_size == null) {
    v._last_size = -1;
  }
  if (size === v._last_size) {
    return;
  }
  s = v.model.document.solver();
  v._last_size = size;
  if (v._size_constraint != null) {
    s.remove_constraint(v._size_constraint);
  }
  v._size_constraint = GE(v.model.panel._size, -size);
  s.add_constraint(v._size_constraint);
  if (v._full_set == null) {
    v._full_set = false;
  }
  if (!v._full_set) {
    side = v.model.panel.side;
    if (side === 'above' || side === 'below') {
      s.add_constraint(EQ(v.model.panel._width, [-1, v.plot_model.canvas._width]));
    }
    if (side === 'left' || side === 'right') {
      s.add_constraint(EQ(v.model.panel._height, [-1, v.plot_model.canvas._height]));
    }
    return v._full_set = true;
  }
};

SidePanel = (function(superClass) {
  extend(SidePanel, superClass);

  function SidePanel() {
    return SidePanel.__super__.constructor.apply(this, arguments);
  }

  SidePanel.internal({
    side: [p.String],
    plot: [p.Instance]
  });

  SidePanel.prototype.initialize = function(attrs, options) {
    SidePanel.__super__.initialize.call(this, attrs, options);
    switch (this.side) {
      case "above":
        this._dim = 0;
        this._normals = [0, -1];
        this._size = this._height;
        return this._anchor = this._bottom;
      case "below":
        this._dim = 0;
        this._normals = [0, 1];
        this._size = this._height;
        return this._anchor = this._top;
      case "left":
        this._dim = 1;
        this._normals = [-1, 0];
        this._size = this._width;
        return this._anchor = this._right;
      case "right":
        this._dim = 1;
        this._normals = [1, 0];
        this._size = this._width;
        return this._anchor = this._left;
      default:
        return logger.error("unrecognized side: '" + this.side + "'");
    }
  };

  SidePanel.prototype.get_constraints = function() {
    var constraints;
    constraints = [];
    constraints.push(GE(this._top));
    constraints.push(GE(this._bottom));
    constraints.push(GE(this._left));
    constraints.push(GE(this._right));
    constraints.push(GE(this._width));
    constraints.push(GE(this._height));
    constraints.push(EQ(this._left, this._width, [-1, this._right]));
    constraints.push(EQ(this._bottom, this._height, [-1, this._top]));
    return constraints;
  };

  SidePanel.prototype.apply_label_text_heuristics = function(ctx, orient) {
    var align, baseline, side;
    side = this.side;
    if (_.isString(orient)) {
      baseline = _baseline_lookup[side][orient];
      align = _align_lookup[side][orient];
    } else if (orient === 0) {
      baseline = _baseline_lookup[side][orient];
      align = _align_lookup[side][orient];
    } else if (orient < 0) {
      baseline = 'middle';
      align = _align_lookup_negative[side];
    } else if (orient > 0) {
      baseline = 'middle';
      align = _align_lookup_positive[side];
    }
    ctx.textBaseline = baseline;
    ctx.textAlign = align;
    return ctx;
  };

  SidePanel.prototype.get_label_angle_heuristic = function(orient) {
    var side;
    side = this.side;
    return _angle_lookup[side][orient];
  };

  return SidePanel;

})(LayoutCanvas.Model);

module.exports = {
  Model: SidePanel,
  update_constraints: update_constraints
};
