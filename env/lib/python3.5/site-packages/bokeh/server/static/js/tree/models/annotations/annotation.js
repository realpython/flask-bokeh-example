var Annotation, AnnotationView, Renderer, SidePanel, _, p,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

SidePanel = require("../../core/layout/side_panel");

p = require("../../core/properties");

Renderer = require("../renderers/renderer");

AnnotationView = (function(superClass) {
  extend(AnnotationView, superClass);

  function AnnotationView() {
    return AnnotationView.__super__.constructor.apply(this, arguments);
  }

  AnnotationView.prototype._get_panel_offset = function() {
    var x, y;
    x = this.model.panel._left._value;
    y = this.model.panel._bottom._value;
    return {
      x: x,
      y: -y
    };
  };

  AnnotationView.prototype._get_size = function() {
    return -1;
  };

  return AnnotationView;

})(Renderer.View);

Annotation = (function(superClass) {
  extend(Annotation, superClass);

  function Annotation() {
    return Annotation.__super__.constructor.apply(this, arguments);
  }

  Annotation.prototype.type = 'Annotation';

  Annotation.prototype.default_view = AnnotationView;

  Annotation.define({
    plot: [p.Instance]
  });

  Annotation.override({
    level: 'annotation'
  });

  Annotation.prototype.add_panel = function(side) {
    this.panel = new SidePanel.Model({
      side: side
    });
    this.panel.attach_document(this.document);
    return this.level = 'overlay';
  };

  return Annotation;

})(Renderer.Model);

module.exports = {
  Model: Annotation,
  View: AnnotationView
};
