var BokehView, Model, Tool, ToolView, _, logger, p,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

logger = require("../../core/logging").logger;

p = require("../../core/properties");

BokehView = require("../../core/bokeh_view");

Model = require("../../model");

ToolView = (function(superClass) {
  extend(ToolView, superClass);

  function ToolView() {
    return ToolView.__super__.constructor.apply(this, arguments);
  }

  ToolView.prototype.initialize = function(options) {
    ToolView.__super__.initialize.call(this, options);
    return this.plot_view = options.plot_view;
  };

  ToolView.getters({
    plot_model: function() {
      return this.plot_view.model;
    }
  });

  ToolView.prototype.bind_bokeh_events = function() {
    return this.listenTo(this.model, 'change:active', (function(_this) {
      return function() {
        if (_this.model.active) {
          return _this.activate();
        } else {
          return _this.deactivate();
        }
      };
    })(this));
  };

  ToolView.prototype.activate = function() {};

  ToolView.prototype.deactivate = function() {};

  return ToolView;

})(BokehView);

Tool = (function(superClass) {
  extend(Tool, superClass);

  function Tool() {
    return Tool.__super__.constructor.apply(this, arguments);
  }

  Tool.getters({
    synthetic_renderers: function() {
      return [];
    }
  });

  Tool.define({
    plot: [p.Instance]
  });

  Tool.internal({
    active: [p.Boolean, false]
  });

  Tool.prototype._get_dim_tooltip = function(name, dims) {
    switch (dims) {
      case 'width':
        return name + " (x-axis)";
      case 'height':
        return name + " (y-axis)";
      case 'both':
        return name;
    }
  };

  Tool.prototype._get_dim_limits = function(arg, arg1, frame, dims) {
    var hr, vr, vx0, vx1, vxlim, vy0, vy1, vylim;
    vx0 = arg[0], vy0 = arg[1];
    vx1 = arg1[0], vy1 = arg1[1];
    hr = frame.h_range;
    if (dims === 'width' || dims === 'both') {
      vxlim = [_.min([vx0, vx1]), _.max([vx0, vx1])];
      vxlim = [_.max([vxlim[0], hr.min]), _.min([vxlim[1], hr.max])];
    } else {
      vxlim = [hr.min, hr.max];
    }
    vr = frame.v_range;
    if (dims === 'height' || dims === 'both') {
      vylim = [_.min([vy0, vy1]), _.max([vy0, vy1])];
      vylim = [_.max([vylim[0], vr.min]), _.min([vylim[1], vr.max])];
    } else {
      vylim = [vr.min, vr.max];
    }
    return [vxlim, vylim];
  };

  return Tool;

})(Model);

module.exports = {
  Model: Tool,
  View: ToolView
};
