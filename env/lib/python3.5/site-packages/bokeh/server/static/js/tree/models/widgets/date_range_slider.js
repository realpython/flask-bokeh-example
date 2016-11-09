var $, $1, DateRangeSlider, DateRangeSliderView, InputWidget, _, p,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

$ = require("jquery");

$1 = require("jqrangeslider/jQDateRangeSlider");

p = require("../../core/properties");

InputWidget = require("./input_widget");

DateRangeSliderView = (function(superClass) {
  extend(DateRangeSliderView, superClass);

  function DateRangeSliderView() {
    return DateRangeSliderView.__super__.constructor.apply(this, arguments);
  }

  DateRangeSliderView.prototype.initialize = function(options) {
    DateRangeSliderView.__super__.initialize.call(this, options);
    this.render();
    return this.listenTo(this.model, 'change', (function(_this) {
      return function() {
        return _this.render;
      };
    })(this));
  };

  DateRangeSliderView.prototype.render = function() {
    var bounds_max, bounds_min, range_max, range_min, ref, ref1, ref2, value_max, value_min;
    DateRangeSliderView.__super__.render.call(this);
    this.$el.empty();
    ref = this.model.value, value_min = ref[0], value_max = ref[1];
    ref1 = this.model.range, range_min = ref1[0], range_max = ref1[1];
    ref2 = this.model.bounds, bounds_min = ref2[0], bounds_max = ref2[1];
    this.$el.dateRangeSlider({
      defaultValues: {
        min: new Date(value_min),
        max: new Date(value_max)
      },
      bounds: {
        min: new Date(bounds_min),
        max: new Date(bounds_max)
      },
      range: {
        min: _.isObject(range_min) ? range_min : false,
        max: _.isObject(range_max) ? range_max : false
      },
      step: this.model.step || {},
      enabled: this.model.enabled,
      arrows: this.model.arrows,
      valueLabels: this.model.value_labels,
      wheelMode: this.model.wheel_mode
    });
    this.$el.on("userValuesChanged", (function(_this) {
      return function(event, data) {
        var ref3;
        _this.model.value = [data.values.min, data.values.max];
        return (ref3 = _this.model.callback) != null ? ref3.execute(_this.model) : void 0;
      };
    })(this));
    return this;
  };

  return DateRangeSliderView;

})(InputWidget.View);

DateRangeSlider = (function(superClass) {
  extend(DateRangeSlider, superClass);

  function DateRangeSlider() {
    return DateRangeSlider.__super__.constructor.apply(this, arguments);
  }

  DateRangeSlider.prototype.type = "DateRangeSlider";

  DateRangeSlider.prototype.default_view = DateRangeSliderView;

  DateRangeSlider.define({
    value: [p.Any],
    range: [p.Any],
    bounds: [p.Any],
    step: [p.Any, {}],
    enabled: [p.Bool, true],
    arrows: [p.Bool, true],
    value_labels: [p.String, "show"],
    wheel_mode: [p.Any]

    /*
    formatter
    scales
     */
  });

  return DateRangeSlider;

})(InputWidget.Model);

module.exports = {
  Model: DateRangeSlider,
  View: DateRangeSliderView
};
