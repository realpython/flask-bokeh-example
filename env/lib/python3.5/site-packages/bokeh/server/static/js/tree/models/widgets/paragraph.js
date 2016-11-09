var $, Markup, Paragraph, ParagraphView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

$ = require("jquery");

Markup = require("./markup");

ParagraphView = (function(superClass) {
  extend(ParagraphView, superClass);

  function ParagraphView() {
    return ParagraphView.__super__.constructor.apply(this, arguments);
  }

  ParagraphView.prototype.render = function() {
    var $para;
    ParagraphView.__super__.render.call(this);
    $para = $('<p style="margin: 0;"></p>').text(this.model.text);
    return this.$el.find('.bk-markup').append($para);
  };

  return ParagraphView;

})(Markup.View);

Paragraph = (function(superClass) {
  extend(Paragraph, superClass);

  function Paragraph() {
    return Paragraph.__super__.constructor.apply(this, arguments);
  }

  Paragraph.prototype.type = "Paragraph";

  Paragraph.prototype.default_view = ParagraphView;

  return Paragraph;

})(Markup.Model);

module.exports = {
  Model: Paragraph,
  View: ParagraphView
};
