var DynamicImageRenderer, DynamicImageView, ImagePool, Renderer, _, logger, p,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

ImagePool = require("./image_pool");

Renderer = require("../renderers/renderer");

logger = require("../../core/logging").logger;

p = require("../../core/properties");

DynamicImageView = (function(superClass) {
  extend(DynamicImageView, superClass);

  function DynamicImageView() {
    this._on_image_error = bind(this._on_image_error, this);
    this._on_image_load = bind(this._on_image_load, this);
    return DynamicImageView.__super__.constructor.apply(this, arguments);
  }

  DynamicImageView.prototype.bind_bokeh_events = function() {
    return this.listenTo(this.model, 'change', this.request_render);
  };

  DynamicImageView.prototype.get_extent = function() {
    return [this.x_range.start, this.y_range.start, this.x_range.end, this.y_range.end];
  };

  DynamicImageView.prototype._set_data = function() {
    this.map_plot = this.plot_view.model.plot;
    this.map_canvas = this.plot_view.canvas_view.ctx;
    this.map_frame = this.plot_view.frame;
    this.x_range = this.map_plot.x_range;
    this.x_mapper = this.map_frame.x_mappers['default'];
    this.y_range = this.map_plot.y_range;
    this.y_mapper = this.map_frame.y_mappers['default'];
    this.lastImage = void 0;
    return this.extent = this.get_extent();
  };

  DynamicImageView.prototype._map_data = function() {
    return this.initial_extent = this.get_extent();
  };

  DynamicImageView.prototype._on_image_load = function(e) {
    var image_data;
    image_data = e.target.image_data;
    image_data.img = e.target;
    image_data.loaded = true;
    this.lastImage = image_data;
    if (this.get_extent().join(':') === image_data.cache_key) {
      return this.request_render();
    }
  };

  DynamicImageView.prototype._on_image_error = function(e) {
    var image_data;
    logger.error('Error loading image: #{e.target.src}');
    image_data = e.target.image_data;
    return this.model.image_source.remove_image(image_data);
  };

  DynamicImageView.prototype._create_image = function(bounds) {
    var image;
    image = new Image();
    image.onload = this._on_image_load;
    image.onerror = this._on_image_error;
    image.alt = '';
    image.image_data = {
      bounds: bounds,
      loaded: false,
      cache_key: bounds.join(':')
    };
    this.model.image_source.add_image(image.image_data);
    image.src = this.model.image_source.get_image_url(bounds[0], bounds[1], bounds[2], bounds[3], Math.ceil(this.map_frame.height), Math.ceil(this.map_frame.width));
    return image;
  };

  DynamicImageView.prototype.render = function(ctx, indices, args) {
    var extent, image_obj;
    if (this.map_initialized == null) {
      this._set_data();
      this._map_data();
      this.map_initialized = true;
    }
    extent = this.get_extent();
    if (this.render_timer) {
      clearTimeout(this.render_timer);
    }
    image_obj = this.model.image_source.images[extent.join(':')];
    if ((image_obj != null) && image_obj.loaded) {
      this._draw_image(extent.join(':'));
      return;
    }
    if (this.lastImage != null) {
      this._draw_image(this.lastImage.cache_key);
    }
    if (image_obj == null) {
      return this.render_timer = setTimeout(((function(_this) {
        return function() {
          return _this._create_image(extent);
        };
      })(this)), 125);
    }
  };

  DynamicImageView.prototype._draw_image = function(image_key) {
    var image_obj, ref, ref1, sh, sw, sx, sxmax, sxmin, sy, symax, symin;
    image_obj = this.model.image_source.images[image_key];
    if (image_obj != null) {
      this.map_canvas.save();
      this._set_rect();
      this.map_canvas.globalAlpha = this.model.alpha;
      ref = this.plot_view.frame.map_to_screen([image_obj.bounds[0]], [image_obj.bounds[3]], this.plot_view.canvas), sxmin = ref[0], symin = ref[1];
      ref1 = this.plot_view.frame.map_to_screen([image_obj.bounds[2]], [image_obj.bounds[1]], this.plot_view.canvas), sxmax = ref1[0], symax = ref1[1];
      sxmin = sxmin[0];
      symin = symin[0];
      sxmax = sxmax[0];
      symax = symax[0];
      sw = sxmax - sxmin;
      sh = symax - symin;
      sx = sxmin;
      sy = symin;
      this.map_canvas.drawImage(image_obj.img, sx, sy, sw, sh);
      return this.map_canvas.restore();
    }
  };

  DynamicImageView.prototype._set_rect = function() {
    var h, l, outline_width, t, w;
    outline_width = this.plot_model.plot.properties.outline_line_width.value();
    l = this.plot_view.canvas.vx_to_sx(this.map_frame.left) + (outline_width / 2);
    t = this.plot_view.canvas.vy_to_sy(this.map_frame.top) + (outline_width / 2);
    w = this.map_frame.width - outline_width;
    h = this.map_frame.height - outline_width;
    this.map_canvas.rect(l, t, w, h);
    return this.map_canvas.clip();
  };

  return DynamicImageView;

})(Renderer.View);

DynamicImageRenderer = (function(superClass) {
  extend(DynamicImageRenderer, superClass);

  function DynamicImageRenderer() {
    return DynamicImageRenderer.__super__.constructor.apply(this, arguments);
  }

  DynamicImageRenderer.prototype.default_view = DynamicImageView;

  DynamicImageRenderer.prototype.type = 'DynamicImageRenderer';

  DynamicImageRenderer.define({
    alpha: [p.Number, 1.0],
    image_source: [p.Instance],
    render_parents: [p.Bool, true]
  });

  DynamicImageRenderer.override({
    level: 'underlay'
  });

  return DynamicImageRenderer;

})(Renderer.Model);

module.exports = {
  Model: DynamicImageRenderer,
  View: DynamicImageView
};
