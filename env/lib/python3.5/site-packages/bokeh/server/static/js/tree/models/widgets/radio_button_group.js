var $, $1, RadioButtonGroup, RadioButtonGroupView, Widget, _, p, template,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

$ = require("jquery");

$1 = require("bootstrap/button");

p = require("../../core/properties");

Widget = require("./widget");

template = require("./button_group_template");

RadioButtonGroupView = (function(superClass) {
  extend(RadioButtonGroupView, superClass);

  function RadioButtonGroupView() {
    return RadioButtonGroupView.__super__.constructor.apply(this, arguments);
  }

  RadioButtonGroupView.prototype.events = {
    "change input": "change_input"
  };

  RadioButtonGroupView.prototype.template = template;

  RadioButtonGroupView.prototype.initialize = function(options) {
    RadioButtonGroupView.__super__.initialize.call(this, options);
    this.render();
    return this.listenTo(this.model, 'change', this.render);
  };

  RadioButtonGroupView.prototype.render = function() {
    var $input, $label, active, html, i, j, label, len, name, ref;
    RadioButtonGroupView.__super__.render.call(this);
    this.$el.empty();
    html = this.template();
    this.$el.append(html);
    name = _.uniqueId("RadioButtonGroup");
    active = this.model.active;
    ref = this.model.labels;
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      label = ref[i];
      $input = $('<input type="radio">').attr({
        name: name,
        value: "" + i
      });
      if (i === active) {
        $input.prop("checked", true);
      }
      $label = $('<label class="bk-bs-btn"></label>');
      $label.text(label).prepend($input);
      $label.addClass("bk-bs-btn-" + this.model.button_type);
      if (i === active) {
        $label.addClass("bk-bs-active");
      }
      this.$el.find('.bk-bs-btn-group').append($label);
    }
    return this;
  };

  RadioButtonGroupView.prototype.change_input = function() {
    var active, i, radio, ref;
    active = (function() {
      var j, len, ref, results;
      ref = this.$("input");
      results = [];
      for (i = j = 0, len = ref.length; j < len; i = ++j) {
        radio = ref[i];
        if (radio.checked) {
          results.push(i);
        }
      }
      return results;
    }).call(this);
    this.model.active = active[0];
    return (ref = this.model.callback) != null ? ref.execute(this.model) : void 0;
  };

  return RadioButtonGroupView;

})(Widget.View);

RadioButtonGroup = (function(superClass) {
  extend(RadioButtonGroup, superClass);

  function RadioButtonGroup() {
    return RadioButtonGroup.__super__.constructor.apply(this, arguments);
  }

  RadioButtonGroup.prototype.type = "RadioButtonGroup";

  RadioButtonGroup.prototype.default_view = RadioButtonGroupView;

  RadioButtonGroup.define({
    active: [p.Any, null],
    labels: [p.Array, []],
    button_type: [p.String, "default"],
    callback: [p.Instance]
  });

  return RadioButtonGroup;

})(Widget.Model);

module.exports = {
  Model: RadioButtonGroup,
  View: RadioButtonGroupView
};
