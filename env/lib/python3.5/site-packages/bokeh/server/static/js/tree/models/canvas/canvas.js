var BokehView, Canvas, CanvasView, EQ, GE, LayoutCanvas, _, canvas_template, fixup_ellipse, fixup_image_smoothing, fixup_line_dash, fixup_line_dash_offset, fixup_measure_text, get_scale_ratio, logger, p, ref, ref1,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

canvas_template = require("./canvas_template");

LayoutCanvas = require("../../core/layout/layout_canvas");

BokehView = require("../../core/bokeh_view");

ref = require("../../core/layout/solver"), GE = ref.GE, EQ = ref.EQ;

logger = require("../../core/logging").logger;

p = require("../../core/properties");

ref1 = require("../../core/util/canvas"), fixup_image_smoothing = ref1.fixup_image_smoothing, fixup_line_dash = ref1.fixup_line_dash, fixup_line_dash_offset = ref1.fixup_line_dash_offset, fixup_measure_text = ref1.fixup_measure_text, get_scale_ratio = ref1.get_scale_ratio, fixup_ellipse = ref1.fixup_ellipse;

CanvasView = (function(superClass) {
  extend(CanvasView, superClass);

  function CanvasView() {
    return CanvasView.__super__.constructor.apply(this, arguments);
  }

  CanvasView.prototype.className = "bk-canvas-wrapper";

  CanvasView.prototype.template = canvas_template;

  CanvasView.prototype.initialize = function(options) {
    var html, ref2;
    CanvasView.__super__.initialize.call(this, options);
    html = this.template({
      map: this.model.map
    });
    this.$el.html(html);
    this.ctx = this.get_ctx();
    this.ctx.glcanvas = null;
    fixup_line_dash(this.ctx);
    fixup_line_dash_offset(this.ctx);
    fixup_image_smoothing(this.ctx);
    fixup_measure_text(this.ctx);
    fixup_ellipse(this.ctx);
    this.map_div = (ref2 = this.$('div.bk-canvas-map')) != null ? ref2 : null;
    this.set_dims([this.model.initial_width, this.model.initial_height]);
    return logger.debug("CanvasView initialized");
  };

  CanvasView.prototype.get_canvas_element = function() {
    return this.$('canvas.bk-canvas')[0];
  };

  CanvasView.prototype.get_ctx = function() {
    var canvas_el, ctx;
    canvas_el = this.$('canvas.bk-canvas');
    ctx = canvas_el[0].getContext('2d');
    return ctx;
  };

  CanvasView.prototype.prepare_canvas = function(force) {
    var canvas_el, dpr, height, ratio, width;
    if (force == null) {
      force = false;
    }
    width = this.model._width._value;
    height = this.model._height._value;
    dpr = window.devicePixelRatio;
    if (!_.isEqual(this.last_dims, [width, height, dpr]) || force) {
      this.$el.css({
        width: width,
        height: height
      });
      this.pixel_ratio = ratio = get_scale_ratio(this.ctx, this.model.use_hidpi);
      canvas_el = this.$('.bk-canvas');
      canvas_el.css({
        width: width,
        height: height
      });
      canvas_el.attr('width', width * ratio);
      canvas_el.attr('height', height * ratio);
      logger.debug("Rendering CanvasView [force=" + force + "] with width: " + width + ", height: " + height + ", ratio: " + ratio);
      this.model.pixel_ratio = this.pixel_ratio;
      return this.last_dims = [width, height, dpr];
    }
  };

  CanvasView.prototype.set_dims = function(dims, trigger) {
    if (trigger == null) {
      trigger = true;
    }
    this.requested_width = dims[0];
    this.requested_height = dims[1];
    this.update_constraints(trigger);
  };

  CanvasView.prototype.update_constraints = function(trigger) {
    var MIN_SIZE, requested_height, requested_width, s;
    if (trigger == null) {
      trigger = true;
    }
    requested_width = this.requested_width;
    requested_height = this.requested_height;
    if ((requested_width == null) || (requested_height == null)) {
      return;
    }
    MIN_SIZE = 50;
    if (requested_width < MIN_SIZE || requested_height < MIN_SIZE) {
      return;
    }
    if (_.isEqual(this.last_requested_dims, [requested_width, requested_height])) {
      return;
    }
    s = this.model.document.solver();
    if (this._width_constraint != null) {
      s.remove_constraint(this._width_constraint);
    }
    this._width_constraint = EQ(this.model._width, -requested_width);
    s.add_constraint(this._width_constraint);
    if (this._height_constraint != null) {
      s.remove_constraint(this._height_constraint);
    }
    this._height_constraint = EQ(this.model._height, -requested_height);
    s.add_constraint(this._height_constraint);
    this.last_requested_dims = [requested_width, requested_height];
    return s.update_variables(trigger);
  };

  return CanvasView;

})(BokehView);

Canvas = (function(superClass) {
  extend(Canvas, superClass);

  function Canvas() {
    return Canvas.__super__.constructor.apply(this, arguments);
  }

  Canvas.prototype.type = 'Canvas';

  Canvas.prototype.default_view = CanvasView;

  Canvas.internal({
    map: [p.Boolean, false],
    initial_width: [p.Number],
    initial_height: [p.Number],
    use_hidpi: [p.Boolean, true],
    pixel_ratio: [p.Number]
  });

  Canvas.prototype.initialize = function(attrs, options) {
    Canvas.__super__.initialize.call(this, attrs, options);
    return this.panel = this;
  };

  Canvas.prototype.vx_to_sx = function(x) {
    return x;
  };

  Canvas.prototype.vy_to_sy = function(y) {
    return this._height._value - (y + 1);
  };

  Canvas.prototype.v_vx_to_sx = function(xx) {
    return new Float64Array(xx);
  };

  Canvas.prototype.v_vy_to_sy = function(yy) {
    var _yy, height, i, idx, len, y;
    _yy = new Float64Array(yy.length);
    height = this._height._value;
    for (idx = i = 0, len = yy.length; i < len; idx = ++i) {
      y = yy[idx];
      _yy[idx] = height - (y + 1);
    }
    return _yy;
  };

  Canvas.prototype.sx_to_vx = function(x) {
    return x;
  };

  Canvas.prototype.sy_to_vy = function(y) {
    return this._height._value - (y + 1);
  };

  Canvas.prototype.v_sx_to_vx = function(xx) {
    return new Float64Array(xx);
  };

  Canvas.prototype.v_sy_to_vy = function(yy) {
    var _yy, height, i, idx, len, y;
    _yy = new Float64Array(yy.length);
    height = this._height._value;
    for (idx = i = 0, len = yy.length; i < len; idx = ++i) {
      y = yy[idx];
      _yy[idx] = height - (y + 1);
    }
    return _yy;
  };

  Canvas.prototype.get_constraints = function() {
    var constraints;
    constraints = Canvas.__super__.get_constraints.call(this);
    constraints.push(GE(this._top));
    constraints.push(GE(this._bottom));
    constraints.push(GE(this._left));
    constraints.push(GE(this._right));
    constraints.push(GE(this._width));
    constraints.push(GE(this._height));
    constraints.push(EQ(this._width, [-1, this._right]));
    constraints.push(EQ(this._height, [-1, this._top]));
    return constraints;
  };

  return Canvas;

})(LayoutCanvas.Model);

module.exports = {
  Model: Canvas,
  View: CanvasView
};
