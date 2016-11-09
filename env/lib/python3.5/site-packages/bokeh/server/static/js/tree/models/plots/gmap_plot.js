var GMapPlot, GMapPlotCanvas, GMapPlotView, Plot, _, logger, p,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

logger = require("../../core/logging").logger;

GMapPlotCanvas = require("./gmap_plot_canvas");

Plot = require("./plot");

p = require("../../core/properties");

GMapPlotView = (function(superClass) {
  extend(GMapPlotView, superClass);

  function GMapPlotView() {
    return GMapPlotView.__super__.constructor.apply(this, arguments);
  }

  return GMapPlotView;

})(Plot.View);

GMapPlot = (function(superClass) {
  extend(GMapPlot, superClass);

  function GMapPlot() {
    return GMapPlot.__super__.constructor.apply(this, arguments);
  }

  GMapPlot.prototype.type = 'GMapPlot';

  GMapPlot.prototype.default_view = GMapPlotView;

  GMapPlot.prototype.initialize = function(options) {
    GMapPlot.__super__.initialize.call(this, options);
    if (!this.api_key) {
      logger.error("api_key is required. See https://developers.google.com/maps/documentation/javascript/get-api-key for more information on how to obtain your own.");
    }
    this._plot_canvas = new GMapPlotCanvas.Model({
      plot: this
    });
    return this.plot_canvas.toolbar = this.toolbar;
  };

  GMapPlot.define({
    map_options: [p.Any],
    api_key: [p.String]
  });

  return GMapPlot;

})(Plot.Model);

module.exports = {
  Model: GMapPlot,
  View: GMapPlotView
};
