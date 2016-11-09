var BokehView, Model, Renderer, RendererView, Visuals, _, logger, p, proj,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

BokehView = require("../../core/bokeh_view");

Visuals = require("../../core/visuals").Visuals;

logger = require("../../core/logging").logger;

p = require("../../core/properties");

proj = require("../../core/util/projections");

Model = require("../../model");

RendererView = (function(superClass) {
  extend(RendererView, superClass);

  function RendererView() {
    return RendererView.__super__.constructor.apply(this, arguments);
  }

  RendererView.prototype.initialize = function(options) {
    RendererView.__super__.initialize.call(this, options);
    this.plot_view = options.plot_view;
    return this.visuals = new Visuals(this.model);
  };

  RendererView.getters({
    plot_model: function() {
      return this.plot_view.model;
    }
  });

  RendererView.prototype.request_render = function() {
    return this.plot_view.request_render();
  };

  RendererView.prototype.set_data = function(source) {
    var data, ref, ref1;
    data = this.model.materialize_dataspecs(source);
    _.extend(this, data);
    if (this.plot_model.use_map) {
      if (this._x != null) {
        ref = proj.project_xy(this._x, this._y), this._x = ref[0], this._y = ref[1];
      }
      if (this._xs != null) {
        return ref1 = proj.project_xsys(this._xs, this._ys), this._xs = ref1[0], this._ys = ref1[1], ref1;
      }
    }
  };

  RendererView.prototype.map_to_screen = function(x, y) {
    return this.plot_view.map_to_screen(x, y, this.model.x_range_name, this.model.y_range_name);
  };

  return RendererView;

})(BokehView);

Renderer = (function(superClass) {
  extend(Renderer, superClass);

  function Renderer() {
    return Renderer.__super__.constructor.apply(this, arguments);
  }

  Renderer.prototype.type = "Renderer";

  Renderer.define({
    level: [p.RenderLevel, null],
    visible: [p.Bool, true]
  });

  return Renderer;

})(Model);

module.exports = {
  Model: Renderer,
  View: RendererView
};
