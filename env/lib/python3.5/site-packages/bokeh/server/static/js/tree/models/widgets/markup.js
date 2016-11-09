var Markup, MarkupView, Widget, p, template,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

p = require("../../core/properties");

Widget = require("./widget");

template = require("./markup_template");

MarkupView = (function(superClass) {
  extend(MarkupView, superClass);

  function MarkupView() {
    return MarkupView.__super__.constructor.apply(this, arguments);
  }

  MarkupView.prototype.template = template;

  MarkupView.prototype.initialize = function(options) {
    MarkupView.__super__.initialize.call(this, options);
    this.render();
    return this.listenTo(this.model, 'change', this.render);
  };

  MarkupView.prototype.render = function() {
    MarkupView.__super__.render.call(this);
    this.$el.empty();
    this.$el.html(this.template());
    if (this.model.height) {
      this.$el.height(this.model.height);
    }
    if (this.model.width) {
      return this.$el.width(this.model.width);
    }
  };

  return MarkupView;

})(Widget.View);

Markup = (function(superClass) {
  extend(Markup, superClass);

  function Markup() {
    return Markup.__super__.constructor.apply(this, arguments);
  }

  Markup.prototype.type = "Markup";

  Markup.prototype.initialize = function(options) {
    return Markup.__super__.initialize.call(this, options);
  };

  Markup.define({
    text: [p.String, '']
  });

  return Markup;

})(Widget.Model);

module.exports = {
  Model: Markup,
  View: MarkupView
};
