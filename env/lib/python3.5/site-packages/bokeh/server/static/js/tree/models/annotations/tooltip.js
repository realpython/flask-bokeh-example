var $, Annotation, Tooltip, TooltipView, _, logger, p,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

$ = require("jquery");

_ = require("underscore");

Annotation = require("./annotation");

logger = require("../../core/logging").logger;

p = require("../../core/properties");

TooltipView = (function(superClass) {
  extend(TooltipView, superClass);

  function TooltipView() {
    return TooltipView.__super__.constructor.apply(this, arguments);
  }

  TooltipView.prototype.className = "bk-tooltip";

  TooltipView.prototype.initialize = function(options) {
    TooltipView.__super__.initialize.call(this, options);
    this.$el.appendTo(this.plot_view.$el.find('div.bk-canvas-overlays'));
    this.$el.css({
      'z-index': 1010
    });
    return this.$el.hide();
  };

  TooltipView.prototype.bind_bokeh_events = function() {
    return this.listenTo(this.model, 'change:data', this._draw_tips);
  };

  TooltipView.prototype.render = function() {
    return this._draw_tips();
  };

  TooltipView.prototype._draw_tips = function() {
    var arrow_size, attachment, bottom, content, data, height, i, left, len, side, sx, sy, tip, top, val, vx, vy, width;
    data = this.model.data;
    this.$el.empty();
    this.$el.hide();
    this.$el.toggleClass("bk-tooltip-custom", this.model.custom);
    if (_.isEmpty(data)) {
      return;
    }
    for (i = 0, len = data.length; i < len; i++) {
      val = data[i];
      vx = val[0], vy = val[1], content = val[2];
      if (this.model.inner_only && !this.plot_view.frame.contains(vx, vy)) {
        continue;
      }
      tip = $('<div />').appendTo(this.$el);
      tip.append(content);
    }
    sx = this.plot_view.model.canvas.vx_to_sx(vx);
    sy = this.plot_view.model.canvas.vy_to_sy(vy);
    attachment = this.model.attachment;
    switch (attachment) {
      case "horizontal":
        width = this.plot_view.frame.width;
        left = this.plot_view.frame.left;
        if (vx - left < width / 2) {
          side = 'right';
        } else {
          side = 'left';
        }
        break;
      case "vertical":
        height = this.plot_view.frame.height;
        bottom = this.plot_view.frame.bottom;
        if (vy - bottom < height / 2) {
          side = 'below';
        } else {
          side = 'above';
        }
        break;
      default:
        side = attachment;
    }
    this.$el.removeClass('bk-right bk-left bk-above bk-below');
    arrow_size = 10;
    switch (side) {
      case "right":
        this.$el.addClass("bk-left");
        left = sx + (this.$el.outerWidth() - this.$el.innerWidth()) + arrow_size;
        top = sy - this.$el.outerHeight() / 2;
        break;
      case "left":
        this.$el.addClass("bk-right");
        left = sx - this.$el.outerWidth() - arrow_size;
        top = sy - this.$el.outerHeight() / 2;
        break;
      case "above":
        this.$el.addClass("bk-above");
        top = sy + (this.$el.outerHeight() - this.$el.innerHeight()) + arrow_size;
        left = Math.round(sx - this.$el.outerWidth() / 2);
        break;
      case "below":
        this.$el.addClass("bk-below");
        top = sy - this.$el.outerHeight() - arrow_size;
        left = Math.round(sx - this.$el.outerWidth() / 2);
    }
    if (this.model.show_arrow) {
      this.$el.addClass("bk-tooltip-arrow");
    }
    if (this.$el.children().length > 0) {
      this.$el.css({
        top: top,
        left: left
      });
      return this.$el.show();
    }
  };

  return TooltipView;

})(Annotation.View);

Tooltip = (function(superClass) {
  extend(Tooltip, superClass);

  function Tooltip() {
    return Tooltip.__super__.constructor.apply(this, arguments);
  }

  Tooltip.prototype.default_view = TooltipView;

  Tooltip.prototype.type = 'Tooltip';

  Tooltip.define({
    attachment: [p.String, 'horizontal'],
    inner_only: [p.Bool, true],
    show_arrow: [p.Bool, true]
  });

  Tooltip.override({
    level: 'overlay'
  });

  Tooltip.internal({
    data: [p.Any, []],
    custom: [p.Any]
  });

  Tooltip.prototype.clear = function() {
    return this.data = [];
  };

  Tooltip.prototype.add = function(vx, vy, content) {
    var data;
    data = this.data;
    data.push([vx, vy, content]);
    this.data = data;
    return this.trigger('change:data');
  };

  return Tooltip;

})(Annotation.Model);

module.exports = {
  Model: Tooltip,
  View: TooltipView
};
