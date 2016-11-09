var GMapPlotCanvas, GMapPlotCanvasView, PlotCanvas, _, p, proj4, toProjection,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

proj4 = require("../../core/util/proj4");

toProjection = proj4.defs('GOOGLE');

PlotCanvas = require("./plot_canvas");

p = require("../../core/properties");

GMapPlotCanvasView = (function(superClass) {
  extend(GMapPlotCanvasView, superClass);

  function GMapPlotCanvasView() {
    this.setRanges = bind(this.setRanges, this);
    this.getProjectedBounds = bind(this.getProjectedBounds, this);
    this.getLatLngBounds = bind(this.getLatLngBounds, this);
    return GMapPlotCanvasView.__super__.constructor.apply(this, arguments);
  }

  GMapPlotCanvasView.prototype.initialize = function(options) {
    GMapPlotCanvasView.__super__.initialize.call(this, _.defaults(options, this.default_options));
    return this.zoom_count = 0;
  };

  GMapPlotCanvasView.prototype.getLatLngBounds = function() {
    var bottom_left, bounds, top_right, xend, xstart, yend, ystart;
    bounds = this.map.getBounds();
    top_right = bounds.getNorthEast();
    bottom_left = bounds.getSouthWest();
    xstart = bottom_left.lng();
    xend = top_right.lng();
    ystart = bottom_left.lat();
    yend = top_right.lat();
    return [xstart, xend, ystart, yend];
  };

  GMapPlotCanvasView.prototype.getProjectedBounds = function() {
    var proj_xend, proj_xstart, proj_yend, proj_ystart, ref, ref1, ref2, xend, xstart, yend, ystart;
    ref = this.getLatLngBounds(), xstart = ref[0], xend = ref[1], ystart = ref[2], yend = ref[3];
    ref1 = proj4(toProjection, [xstart, ystart]), proj_xstart = ref1[0], proj_ystart = ref1[1];
    ref2 = proj4(toProjection, [xend, yend]), proj_xend = ref2[0], proj_yend = ref2[1];
    return [proj_xstart, proj_xend, proj_ystart, proj_yend];
  };

  GMapPlotCanvasView.prototype.setRanges = function() {
    var proj_xend, proj_xstart, proj_yend, proj_ystart, ref;
    ref = this.getProjectedBounds(), proj_xstart = ref[0], proj_xend = ref[1], proj_ystart = ref[2], proj_yend = ref[3];
    this.x_range.setv({
      start: proj_xstart,
      end: proj_xend
    });
    return this.y_range.setv({
      start: proj_ystart,
      end: proj_yend
    });
  };

  GMapPlotCanvasView.prototype.update_range = function(range_info) {
    var new_map_zoom, original_map_zoom, proj_xend, proj_xstart, proj_yend, proj_ystart, ref, zoom_change;
    this.pause();
    if ((range_info.sdx != null) || (range_info.sdy != null)) {
      this.map.panBy(range_info.sdx, range_info.sdy);
      GMapPlotCanvasView.__super__.update_range.call(this, range_info);
    }
    if (range_info.factor != null) {
      if (this.zoom_count !== 10) {
        this.zoom_count += 1;
        return;
      }
      this.zoom_count = 0;
      GMapPlotCanvasView.__super__.update_range.call(this, range_info);
      if (range_info.factor < 0) {
        zoom_change = -1;
      } else {
        zoom_change = 1;
      }
      original_map_zoom = this.map.getZoom();
      new_map_zoom = original_map_zoom + zoom_change;
      if (new_map_zoom >= 2) {
        this.map.setZoom(new_map_zoom);
        ref = this.getProjectedBounds(), proj_xstart = ref[0], proj_xend = ref[1], proj_ystart = ref[2], proj_yend = ref[3];
        if ((proj_xend - proj_xstart) < 0) {
          this.map.setZoom(original_map_zoom);
        }
      }
      this.setRanges();
    }
    return this.unpause();
  };

  GMapPlotCanvasView.prototype.bind_bokeh_events = function() {
    var build_map, height, left, script, top, width;
    GMapPlotCanvasView.__super__.bind_bokeh_events.call(this);
    width = this.frame.width;
    height = this.frame.height;
    left = this.canvas.vx_to_sx(this.frame.left);
    top = this.canvas.vy_to_sy(this.frame.top);
    this.canvas_view.map_div.attr("style", "top: " + top + "px; left: " + left + "px; position: absolute");
    this.canvas_view.map_div.attr('style', "width:" + width + "px;");
    this.canvas_view.map_div.attr('style', "height:" + height + "px;");
    this.canvas_view.map_div.width(width + "px").height(height + "px");
    this.initial_zoom = this.model.plot.map_options.zoom;
    build_map = (function(_this) {
      return function() {
        var map_options, map_types, maps, mo;
        maps = window.google.maps;
        map_types = {
          "satellite": maps.MapTypeId.SATELLITE,
          "terrain": maps.MapTypeId.TERRAIN,
          "roadmap": maps.MapTypeId.ROADMAP,
          "hybrid": maps.MapTypeId.HYBRID
        };
        mo = _this.model.plot.map_options;
        map_options = {
          center: new maps.LatLng(mo.lat, mo.lng),
          zoom: mo.zoom,
          disableDefaultUI: true,
          mapTypeId: map_types[mo.map_type]
        };
        if (mo.styles != null) {
          map_options.styles = JSON.parse(mo.styles);
        }
        _this.map = new maps.Map(_this.canvas_view.map_div[0], map_options);
        return maps.event.addListenerOnce(_this.map, 'idle', _this.setRanges);
      };
    })(this);
    if (window._bokeh_gmap_loads == null) {
      window._bokeh_gmap_loads = [];
    }
    if ((window.google != null) && (window.google.maps != null)) {
      return _.defer(build_map);
    } else if (window._bokeh_gmap_callback != null) {
      return window._bokeh_gmap_loads.push(build_map);
    } else {
      window._bokeh_gmap_loads.push(build_map);
      window._bokeh_gmap_callback = function() {
        return _.each(window._bokeh_gmap_loads, _.defer);
      };
      script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = "https://maps.googleapis.com/maps/api/js?key=" + this.model.plot.api_key + "&callback=_bokeh_gmap_callback";
      return document.body.appendChild(script);
    }
  };

  GMapPlotCanvasView.prototype._map_hook = function(ctx, frame_box) {
    var height, left, top, width;
    left = frame_box[0], top = frame_box[1], width = frame_box[2], height = frame_box[3];
    this.canvas_view.map_div.attr("style", "top: " + top + "px; left: " + left + "px;");
    return this.canvas_view.map_div.width(width + "px").height(height + "px");
  };

  GMapPlotCanvasView.prototype._paint_empty = function(ctx, frame_box) {
    var ih, iw, left, oh, ow, top;
    ow = this.canvas.width;
    oh = this.canvas.height;
    left = frame_box[0], top = frame_box[1], iw = frame_box[2], ih = frame_box[3];
    ctx.clearRect(0, 0, ow, oh);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, oh);
    ctx.lineTo(ow, oh);
    ctx.lineTo(ow, 0);
    ctx.lineTo(0, 0);
    ctx.moveTo(left, top);
    ctx.lineTo(left + iw, top);
    ctx.lineTo(left + iw, top + ih);
    ctx.lineTo(left, top + ih);
    ctx.lineTo(left, top);
    ctx.closePath();
    ctx.fillStyle = this.model.plot.border_fill_color;
    return ctx.fill();
  };

  return GMapPlotCanvasView;

})(PlotCanvas.View);

GMapPlotCanvas = (function(superClass) {
  extend(GMapPlotCanvas, superClass);

  function GMapPlotCanvas() {
    return GMapPlotCanvas.__super__.constructor.apply(this, arguments);
  }

  GMapPlotCanvas.prototype.type = 'GMapPlotCanvas';

  GMapPlotCanvas.prototype.default_view = GMapPlotCanvasView;

  GMapPlotCanvas.prototype.initialize = function(attrs, options) {
    this.use_map = true;
    return GMapPlotCanvas.__super__.initialize.call(this, attrs, options);
  };

  return GMapPlotCanvas;

})(PlotCanvas.Model);

module.exports = {
  Model: GMapPlotCanvas,
  View: GMapPlotCanvasView
};
