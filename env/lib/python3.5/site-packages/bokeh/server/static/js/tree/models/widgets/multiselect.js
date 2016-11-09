var $, InputWidget, MultiSelect, MultiSelectView, _, multiselecttemplate, p,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("jquery");

$ = require("underscore");

p = require("../../core/properties");

InputWidget = require("./input_widget");

multiselecttemplate = require("./multiselecttemplate");

MultiSelectView = (function(superClass) {
  extend(MultiSelectView, superClass);

  function MultiSelectView() {
    this.render_selection = bind(this.render_selection, this);
    return MultiSelectView.__super__.constructor.apply(this, arguments);
  }

  MultiSelectView.prototype.tagName = "div";

  MultiSelectView.prototype.template = multiselecttemplate;

  MultiSelectView.prototype.events = {
    "change select": "change_input"
  };

  MultiSelectView.prototype.initialize = function(options) {
    MultiSelectView.__super__.initialize.call(this, options);
    this.render();
    this.listenTo(this.model, 'change:value', this.render_selection);
    this.listenTo(this.model, 'change:options', this.render);
    this.listenTo(this.model, 'change:name', this.render);
    return this.listenTo(this.model, 'change:title', this.render);
  };

  MultiSelectView.prototype.render = function() {
    var html;
    MultiSelectView.__super__.render.call(this);
    this.$el.empty();
    html = this.template(this.model.attributes);
    this.$el.html(html);
    this.render_selection();
    return this;
  };

  MultiSelectView.prototype.render_selection = function() {
    var values;
    values = {};
    _.map(this.model.value, function(x) {
      return values[x] = true;
    });
    return this.$('option').each((function(_this) {
      return function(el) {
        el = _this.$(el);
        if (values[el.attr('value')]) {
          return el.attr('selected', 'selected');
        }
      };
    })(this));
  };

  MultiSelectView.prototype.change_input = function() {
    var value;
    value = this.$el.find('select').val();
    if (value) {
      this.model.value = value;
    } else {
      this.model.value = [];
    }
    return MultiSelectView.__super__.change_input.call(this);
  };

  return MultiSelectView;

})(InputWidget.View);

MultiSelect = (function(superClass) {
  extend(MultiSelect, superClass);

  function MultiSelect() {
    return MultiSelect.__super__.constructor.apply(this, arguments);
  }

  MultiSelect.prototype.type = "MultiSelect";

  MultiSelect.prototype.default_view = MultiSelectView;

  MultiSelect.define({
    value: [p.Array, []],
    options: [p.Array, []]
  });

  return MultiSelect;

})(InputWidget.Model);

module.exports = {
  Model: MultiSelect,
  View: MultiSelectView
};
