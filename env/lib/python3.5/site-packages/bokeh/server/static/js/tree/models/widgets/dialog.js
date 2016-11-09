var $, $1, Dialog, DialogView, Widget, _, dialog_template, p,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

$ = require("jquery");

$1 = require("bootstrap/modal");

p = require("../../core/properties");

dialog_template = require("./dialog_template");

Widget = require("./widget");

DialogView = (function(superClass) {
  extend(DialogView, superClass);

  function DialogView() {
    this.change_content = bind(this.change_content, this);
    this.change_visibility = bind(this.change_visibility, this);
    this.onHide = bind(this.onHide, this);
    return DialogView.__super__.constructor.apply(this, arguments);
  }

  DialogView.prototype.initialize = function(options) {
    DialogView.__super__.initialize.call(this, options);
    this.render();
    this.render_content();
    this.render_buttons();
    this.listenTo(this.model, 'destroy', this.remove);
    this.listenTo(this.model, 'change:visible', this.change_visibility);
    return this.listenTo(this.model, 'change:content', this.change_content);
  };

  DialogView.prototype.render_content = function() {
    var content;
    if (this.content_view != null) {
      this.content_view.remove();
    }
    content = this.model.content;
    if (content != null) {
      if (typeof content === 'object') {
        this.content_view = new content.default_view({
          model: content
        });
        this.$el.find('.bk-dialog-content').empty();
        this.$el.find('.bk-dialog-content').append(this.content_view.$el);
      } else {
        this.$el.find('.bk-dialog-content').empty();
        this.$el.find('.bk-dialog-content').text(content);
      }
    }
    return this;
  };

  DialogView.prototype.render_buttons = function() {
    var buttons_box;
    if (this.buttons_box_view != null) {
      this.buttons_box_view.remove();
    }
    buttons_box = this.model.buttons_box;
    if (buttons_box != null) {
      this.buttons_box_view = new buttons_box.default_view({
        model: buttons_box
      });
      this.$el.find('.bk-dialog-buttons_box').empty();
      this.$el.find('.bk-dialog-buttons_box').append(this.buttons_box_view.$el);
    }
    return this;
  };

  DialogView.prototype.render = function() {
    DialogView.__super__.render.call(this);
    this.$modal = $(dialog_template(this.model.attributes));
    this.$modal.modal({
      show: this.model.visible
    });
    this.$modal.on('hidden.bk-bs.modal', this.onHide);
    this.$el.html(this.$modal);
    return this;
  };

  DialogView.prototype.onHide = function(event) {
    return this.model.setv("visible", false, {
      silent: true
    });
  };

  DialogView.prototype.change_visibility = function() {
    return this.$modal.modal(this.model.visible ? "show" : "hide");
  };

  DialogView.prototype.change_content = function() {
    return this.render_content();
  };

  return DialogView;

})(Widget.View);

Dialog = (function(superClass) {
  extend(Dialog, superClass);

  function Dialog() {
    return Dialog.__super__.constructor.apply(this, arguments);
  }

  Dialog.prototype.type = "Dialog";

  Dialog.prototype.default_view = DialogView;

  Dialog.define({
    visible: [p.Bool, false],
    closable: [p.Bool, true],
    title: [p.String, ""],
    content: [p.String, ""],
    buttons: [p.Array, []],
    buttons_box: [p.Instance]
  });

  return Dialog;

})(Widget.Model);

module.exports = {
  Model: Dialog,
  View: DialogView
};
