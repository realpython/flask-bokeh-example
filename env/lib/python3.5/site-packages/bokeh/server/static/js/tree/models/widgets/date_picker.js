var $, $1, DatePicker, DatePickerView, InputWidget, _, p,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

$ = require("jquery");

$1 = require("jquery-ui/datepicker");

p = require("../../core/properties");

InputWidget = require("./input_widget");

DatePickerView = (function(superClass) {
  extend(DatePickerView, superClass);

  function DatePickerView() {
    this.onSelect = bind(this.onSelect, this);
    return DatePickerView.__super__.constructor.apply(this, arguments);
  }

  DatePickerView.prototype.initialize = function(options) {
    DatePickerView.__super__.initialize.call(this, options);
    this.label = $('<label>').text(this.model.title);
    this.input = $('<input type="text">');
    this.datepicker = this.input.datepicker({
      defaultDate: new Date(this.model.value),
      minDate: this.model.min_date != null ? new Date(this.model.min_date) : null,
      maxDate: this.model.max_date != null ? new Date(this.model.max_date) : null,
      onSelect: this.onSelect
    });
    return this.$el.append([this.label, this.input]);
  };

  DatePickerView.prototype.onSelect = function(dateText, ui) {
    var d, ref;
    d = new Date(dateText);
    this.model.value = d.toString();
    return (ref = this.model.callback) != null ? ref.execute(this.model) : void 0;
  };

  return DatePickerView;

})(InputWidget.View);

DatePicker = (function(superClass) {
  extend(DatePicker, superClass);

  function DatePicker() {
    return DatePicker.__super__.constructor.apply(this, arguments);
  }

  DatePicker.prototype.type = "DatePicker";

  DatePicker.prototype.default_view = DatePickerView;

  DatePicker.define({
    value: [p.Any, Date.now()],
    min_date: [p.Any],
    max_date: [p.Any]
  });

  return DatePicker;

})(InputWidget.Model);

module.exports = {
  Model: DatePicker,
  View: DatePickerView
};
