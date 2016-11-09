var CartesianFrame, CategoricalMapper, EQ, GE, GridMapper, LayoutCanvas, LinearMapper, LogMapper, Range1d, _, logging, p, ref,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

CategoricalMapper = require("../mappers/categorical_mapper");

GridMapper = require("../mappers/grid_mapper");

LinearMapper = require("../mappers/linear_mapper");

LogMapper = require("../mappers/log_mapper");

Range1d = require("../ranges/range1d");

ref = require("../../core/layout/solver"), EQ = ref.EQ, GE = ref.GE;

LayoutCanvas = require("../../core/layout/layout_canvas");

logging = require("../../core/logging").logging;

p = require("../../core/properties");

CartesianFrame = (function(superClass) {
  extend(CartesianFrame, superClass);

  function CartesianFrame() {
    return CartesianFrame.__super__.constructor.apply(this, arguments);
  }

  CartesianFrame.prototype.type = 'CartesianFrame';

  CartesianFrame.prototype.initialize = function(attrs, options) {
    CartesianFrame.__super__.initialize.call(this, attrs, options);
    this.panel = this;
    this._configure_mappers();
    this.listenTo(this, 'change', (function(_this) {
      return function() {
        return _this._configure_mappers();
      };
    })(this));
    return null;
  };

  CartesianFrame.prototype._doc_attached = function() {
    this.listenTo(this.document.solver(), 'layout_update', (function(_this) {
      return function() {
        return _this._update_mappers();
      };
    })(this));
    return null;
  };

  CartesianFrame.prototype.contains = function(vx, vy) {
    return vx >= this.left && vx <= this.right && vy >= this.bottom && vy <= this.top;
  };

  CartesianFrame.prototype.map_to_screen = function(x, y, canvas, x_name, y_name) {
    var sx, sy, vx, vy;
    if (x_name == null) {
      x_name = 'default';
    }
    if (y_name == null) {
      y_name = 'default';
    }
    vx = this.x_mappers[x_name].v_map_to_target(x);
    sx = canvas.v_vx_to_sx(vx);
    vy = this.y_mappers[y_name].v_map_to_target(y);
    sy = canvas.v_vy_to_sy(vy);
    return [sx, sy];
  };

  CartesianFrame.prototype._get_ranges = function(range, extra_ranges) {
    var extra_range, name, ranges;
    ranges = {};
    ranges['default'] = range;
    if (extra_ranges != null) {
      for (name in extra_ranges) {
        extra_range = extra_ranges[name];
        ranges[name] = extra_range;
      }
    }
    return ranges;
  };

  CartesianFrame.prototype._get_mappers = function(mapper_type, ranges, frame_range) {
    var mapper_model, mappers, name, range;
    mappers = {};
    for (name in ranges) {
      range = ranges[name];
      if (range.type === "Range1d" || range.type === "DataRange1d") {
        if (mapper_type === "log") {
          mapper_model = LogMapper.Model;
        } else {
          mapper_model = LinearMapper.Model;
        }
      } else if (range.type === "FactorRange") {
        mapper_model = CategoricalMapper.Model;
      } else {
        logger.warn("unknown range type for range '" + name + "': " + range);
        return null;
      }
      mappers[name] = new mapper_model({
        source_range: range,
        target_range: frame_range
      });
    }
    return mappers;
  };

  CartesianFrame.prototype._configure_frame_ranges = function() {
    this._h_range = new Range1d.Model({
      start: this.left,
      end: this.left + this.width
    });
    return this._v_range = new Range1d.Model({
      start: this.bottom,
      end: this.bottom + this.height
    });
  };

  CartesianFrame.prototype._configure_mappers = function() {
    this._configure_frame_ranges();
    this._x_ranges = this._get_ranges(this.x_range, this.extra_x_ranges);
    this._y_ranges = this._get_ranges(this.y_range, this.extra_y_ranges);
    this._x_mappers = this._get_mappers(this.x_mapper_type, this._x_ranges, this._h_range);
    return this._y_mappers = this._get_mappers(this.y_mapper_type, this._y_ranges, this._v_range);
  };

  CartesianFrame.prototype._update_mappers = function() {
    var mapper, name, ref1, ref2;
    this._configure_frame_ranges();
    ref1 = this._x_mappers;
    for (name in ref1) {
      mapper = ref1[name];
      mapper.target_range = this._h_range;
    }
    ref2 = this._y_mappers;
    for (name in ref2) {
      mapper = ref2[name];
      mapper.target_range = this._v_range;
    }
    return null;
  };

  CartesianFrame.getters({
    h_range: function() {
      return this._h_range;
    },
    v_range: function() {
      return this._v_range;
    },
    x_ranges: function() {
      return this._x_ranges;
    },
    y_ranges: function() {
      return this._y_ranges;
    },
    x_mappers: function() {
      return this._x_mappers;
    },
    y_mappers: function() {
      return this._y_mappers;
    }
  });

  CartesianFrame.internal({
    extra_x_ranges: [p.Any, {}],
    extra_y_ranges: [p.Any, {}],
    x_range: [p.Instance],
    y_range: [p.Instance],
    x_mapper_type: [p.String, 'auto'],
    y_mapper_type: [p.String, 'auto']
  });

  CartesianFrame.prototype.get_constraints = function() {
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

  return CartesianFrame;

})(LayoutCanvas.Model);

module.exports = {
  Model: CartesianFrame
};
