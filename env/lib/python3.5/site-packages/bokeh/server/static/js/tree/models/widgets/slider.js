var $2, InputWidget, Slider, SliderView, Widget, _, logger, p, slidertemplate,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

$2 = require("jquery-ui/slider");

logger = require("../../core/logging").logger;

p = require("../../core/properties");

InputWidget = require("./input_widget");

Widget = require("./widget");

slidertemplate = require("./slidertemplate");

SliderView = (function(superClass) {
  extend(SliderView, superClass);

  function SliderView() {
    this.slide = bind(this.slide, this);
    this.slidestop = bind(this.slidestop, this);
    return SliderView.__super__.constructor.apply(this, arguments);
  }

  SliderView.prototype.tagName = "div";

  SliderView.prototype.template = slidertemplate;

  SliderView.prototype.initialize = function(options) {
    var html;
    SliderView.__super__.initialize.call(this, options);
    this.listenTo(this.model, 'change', this.render);
    this.$el.empty();
    html = this.template(this.model.attributes);
    this.$el.html(html);
    this.callbackWrapper = null;
    if (this.model.callback_policy === 'continuous') {
      this.callbackWrapper = function() {
        var ref;
        return (ref = this.model.callback) != null ? ref.execute(this.model) : void 0;
      };
    }
    if (this.model.callback_policy === 'throttle' && this.model.callback) {
      this.callbackWrapper = _.throttle(function() {
        var ref;
        return (ref = this.model.callback) != null ? ref.execute(this.model) : void 0;
      }, this.model.callback_throttle);
    }
    return this.render();
  };

  SliderView.prototype.render = function() {
    var max, min, opts, step;
    SliderView.__super__.render.call(this);
    max = this.model.end;
    min = this.model.start;
    step = this.model.step || ((max - min) / 50);
    logger.debug("slider render: min, max, step = (" + min + ", " + max + ", " + step + ")");
    opts = {
      orientation: this.model.orientation,
      animate: "fast",
      value: this.model.value,
      min: min,
      max: max,
      step: step,
      stop: this.slidestop,
      slide: this.slide
    };
    this.$el.find('.slider').slider(opts);
    if (this.model.title != null) {
      this.$("#" + this.model.id).val(this.$('.slider').slider('value'));
    }
    this.$el.find('.bk-slider-parent').height(this.model.height);
    return this;
  };

  SliderView.prototype.slidestop = function(event, ui) {
    var ref;
    if (this.model.callback_policy === 'mouseup' || this.model.callback_policy === 'throttle') {
      return (ref = this.model.callback) != null ? ref.execute(this.model) : void 0;
    }
  };

  SliderView.prototype.slide = function(event, ui) {
    var value;
    value = ui.value;
    logger.debug("slide value = " + value);
    if (this.model.title != null) {
      this.$("#" + this.model.id).val(ui.value);
    }
    this.model.value = value;
    if (this.callbackWrapper) {
      return this.callbackWrapper();
    }
  };

  return SliderView;

})(InputWidget.View);

Slider = (function(superClass) {
  extend(Slider, superClass);

  function Slider() {
    return Slider.__super__.constructor.apply(this, arguments);
  }

  Slider.prototype.type = "Slider";

  Slider.prototype.default_view = SliderView;

  Slider.define({
    value: [p.Number, 0.5],
    start: [p.Number, 0],
    end: [p.Number, 1],
    step: [p.Number, 0.1],
    orientation: [p.Orientation, "horizontal"],
    callback_throttle: [p.Number, 200],
    callback_policy: [p.String, "throttle"]
  });

  return Slider;

})(InputWidget.Model);

module.exports = {
  Model: Slider,
  View: SliderView
};
