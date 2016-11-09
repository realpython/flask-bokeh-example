var AbstractIcon, Icon, IconView, Widget, _, p,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

p = require("../../core/properties");

AbstractIcon = require("./abstract_icon");

Widget = require("./widget");

IconView = (function(superClass) {
  extend(IconView, superClass);

  function IconView() {
    return IconView.__super__.constructor.apply(this, arguments);
  }

  IconView.prototype.tagName = "i";

  IconView.prototype.initialize = function(options) {
    IconView.__super__.initialize.call(this, options);
    this.render();
    return this.listenTo(this.model, 'change', this.render);
  };

  IconView.prototype.render = function() {
    var flip, size;
    this.$el.empty();
    this.$el.addClass("bk-fa");
    this.$el.addClass("bk-fa-" + this.model.icon_name);
    size = this.model.size;
    if (size != null) {
      this.$el.css({
        "font-size": size + "em"
      });
    }
    flip = this.model.flip;
    if (flip != null) {
      this.$el.addClass("bk-fa-flip-" + flip);
    }
    if (this.model.spin) {
      this.$el.addClass("bk-fa-spin");
    }
    return this;
  };

  IconView.prototype.update_constraints = function() {
    return null;
  };

  return IconView;

})(Widget.View);

Icon = (function(superClass) {
  extend(Icon, superClass);

  function Icon() {
    return Icon.__super__.constructor.apply(this, arguments);
  }

  Icon.prototype.type = "Icon";

  Icon.prototype.default_view = IconView;

  Icon.define({
    icon_name: [p.String, "check"],
    size: [p.Number],
    flip: [p.Any],
    spin: [p.Bool, false]
  });

  return Icon;

})(AbstractIcon.Model);

module.exports = {
  Model: Icon,
  View: IconView
};
