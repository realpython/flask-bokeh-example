var $, ImagePool, Renderer, TileRenderer, TileRendererView, _, logger, p, wmts,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

_ = require("underscore");

$ = require("jquery");

ImagePool = require("./image_pool");

wmts = require("./wmts_tile_source");

Renderer = require("../renderers/renderer");

logger = require("../../core/logging").logger;

p = require("../../core/properties");

TileRendererView = (function(superClass) {
  extend(TileRendererView, superClass);

  function TileRendererView() {
    this._update = bind(this._update, this);
    this._prefetch_tiles = bind(this._prefetch_tiles, this);
    this._on_tile_error = bind(this._on_tile_error, this);
    this._on_tile_cache_load = bind(this._on_tile_cache_load, this);
    this._on_tile_load = bind(this._on_tile_load, this);
    this._add_attribution = bind(this._add_attribution, this);
    return TileRendererView.__super__.constructor.apply(this, arguments);
  }

  TileRendererView.prototype.initialize = function(options) {
    this.attributionEl = null;
    return TileRendererView.__super__.initialize.apply(this, arguments);
  };

  TileRendererView.prototype.bind_bokeh_events = function() {
    return this.listenTo(this.model, 'change', this.request_render);
  };

  TileRendererView.prototype.get_extent = function() {
    return [this.x_range.start, this.y_range.start, this.x_range.end, this.y_range.end];
  };

  TileRendererView.prototype._set_data = function() {
    this.pool = new ImagePool();
    this.map_plot = this.plot_model.plot;
    this.map_canvas = this.plot_view.canvas_view.ctx;
    this.map_frame = this.plot_model.frame;
    this.x_range = this.map_plot.x_range;
    this.x_mapper = this.map_frame.x_mappers['default'];
    this.y_range = this.map_plot.y_range;
    this.y_mapper = this.map_frame.y_mappers['default'];
    this.extent = this.get_extent();
    this._last_height = void 0;
    return this._last_width = void 0;
  };

  TileRendererView.prototype._add_attribution = function() {
    var attribution, border_width, bottom_offset, max_width, overlays, right_offset;
    attribution = this.model.tile_source.attribution;
    if (_.isString(attribution) && attribution.length > 0) {
      if (this.attributionEl != null) {
        return this.attributionEl.html(attribution);
      } else {
        border_width = this.map_plot.outline_line_width;
        bottom_offset = this.map_plot.min_border_bottom + border_width;
        right_offset = this.map_frame.right - this.map_frame.width;
        max_width = this.map_frame.width - border_width;
        this.attributionEl = $('<div>').html(attribution).addClass('bk-tile-attribution').css({
          'position': 'absolute',
          'bottom': bottom_offset + "px",
          'right': right_offset + "px",
          'max-width': max_width + "px",
          'background-color': 'rgba(255,255,255,0.8)',
          'font-size': '9pt',
          'font-family': 'sans-serif'
        });
        overlays = this.plot_view.$el.find('div.bk-canvas-events');
        return this.attributionEl.appendTo(overlays);
      }
    }
  };

  TileRendererView.prototype._map_data = function() {
    var new_extent, zoom_level;
    this.initial_extent = this.get_extent();
    zoom_level = this.model.tile_source.get_level_by_extent(this.initial_extent, this.map_frame.height, this.map_frame.width);
    new_extent = this.model.tile_source.snap_to_zoom(this.initial_extent, this.map_frame.height, this.map_frame.width, zoom_level);
    this.x_range.start = new_extent[0];
    this.y_range.start = new_extent[1];
    this.x_range.end = new_extent[2];
    this.y_range.end = new_extent[3];
    return this._add_attribution();
  };

  TileRendererView.prototype._on_tile_load = function(e) {
    var tile_data;
    tile_data = e.target.tile_data;
    tile_data.img = e.target;
    tile_data.current = true;
    tile_data.loaded = true;
    return this.request_render();
  };

  TileRendererView.prototype._on_tile_cache_load = function(e) {
    var tile_data;
    tile_data = e.target.tile_data;
    tile_data.img = e.target;
    return tile_data.loaded = true;
  };

  TileRendererView.prototype._on_tile_error = function(e) {
    return '';
  };

  TileRendererView.prototype._create_tile = function(x, y, z, bounds, cache_only) {
    var normalized_coords, ref, tile;
    if (cache_only == null) {
      cache_only = false;
    }
    normalized_coords = this.model.tile_source.normalize_xyz(x, y, z);
    tile = this.pool.pop();
    if (cache_only) {
      tile.onload = this._on_tile_cache_load;
    } else {
      tile.onload = this._on_tile_load;
    }
    tile.onerror = this._on_tile_error;
    tile.alt = '';
    tile.tile_data = {
      tile_coords: [x, y, z],
      normalized_coords: normalized_coords,
      quadkey: this.model.tile_source.tile_xyz_to_quadkey(x, y, z),
      cache_key: this.model.tile_source.tile_xyz_to_key(x, y, z),
      bounds: bounds,
      loaded: false,
      x_coord: bounds[0],
      y_coord: bounds[3]
    };
    this.model.tile_source.tiles[tile.tile_data.cache_key] = tile.tile_data;
    tile.src = (ref = this.model.tile_source).get_image_url.apply(ref, normalized_coords);
    return tile;
  };

  TileRendererView.prototype._enforce_aspect_ratio = function() {
    var extent, new_extent, zoom_level;
    if (this._last_height !== this.map_frame.height || this._last_width !== this.map_frame.width) {
      extent = this.get_extent();
      zoom_level = this.model.tile_source.get_level_by_extent(extent, this.map_frame.height, this.map_frame.width);
      new_extent = this.model.tile_source.snap_to_zoom(extent, this.map_frame.height, this.map_frame.width, zoom_level);
      this.x_range.setv({
        start: new_extent[0],
        end: new_extent[2]
      });
      this.y_range.setv({
        start: new_extent[1],
        end: new_extent[3]
      });
      this.extent = new_extent;
      this._last_height = this.map_frame.height;
      this._last_width = this.map_frame.width;
      return true;
    }
    return false;
  };

  TileRendererView.prototype.render = function(ctx, indices, args) {
    if (this.map_initialized == null) {
      this._set_data();
      this._map_data();
      this.map_initialized = true;
    }
    if (this._enforce_aspect_ratio()) {
      return;
    }
    this._update();
    if (this.prefetch_timer != null) {
      clearTimeout(this.prefetch_timer);
    }
    return this.prefetch_timer = setTimeout(this._prefetch_tiles, 500);
  };

  TileRendererView.prototype._draw_tile = function(tile_key) {
    var ref, ref1, sh, sw, sx, sxmax, sxmin, sy, symax, symin, tile_obj;
    tile_obj = this.model.tile_source.tiles[tile_key];
    if (tile_obj != null) {
      ref = this.plot_view.frame.map_to_screen([tile_obj.bounds[0]], [tile_obj.bounds[3]], this.plot_view.canvas), sxmin = ref[0], symin = ref[1];
      ref1 = this.plot_view.frame.map_to_screen([tile_obj.bounds[2]], [tile_obj.bounds[1]], this.plot_view.canvas), sxmax = ref1[0], symax = ref1[1];
      sxmin = sxmin[0];
      symin = symin[0];
      sxmax = sxmax[0];
      symax = symax[0];
      sw = sxmax - sxmin;
      sh = symax - symin;
      sx = sxmin;
      sy = symin;
      return this.map_canvas.drawImage(tile_obj.img, sx, sy, sw, sh);
    }
  };

  TileRendererView.prototype._set_rect = function() {
    var h, l, outline_width, t, w;
    outline_width = this.plot_model.plot.properties.outline_line_width.value();
    l = this.plot_view.canvas.vx_to_sx(this.map_frame.left) + (outline_width / 2);
    t = this.plot_view.canvas.vy_to_sy(this.map_frame.top) + (outline_width / 2);
    w = this.map_frame.width - outline_width;
    h = this.map_frame.height - outline_width;
    this.map_canvas.rect(l, t, w, h);
    return this.map_canvas.clip();
  };

  TileRendererView.prototype._render_tiles = function(tile_keys) {
    var i, len, tile_key;
    this.map_canvas.save();
    this._set_rect();
    this.map_canvas.globalAlpha = this.model.alpha;
    for (i = 0, len = tile_keys.length; i < len; i++) {
      tile_key = tile_keys[i];
      this._draw_tile(tile_key);
    }
    return this.map_canvas.restore();
  };

  TileRendererView.prototype._prefetch_tiles = function() {
    var bounds, c, cbounds, children, cx, cy, cz, extent, h, i, ref, results, t, tile_source, tiles, w, x, y, z, zoom_level;
    tile_source = this.model.tile_source;
    extent = this.get_extent();
    h = this.map_frame.height;
    w = this.map_frame.width;
    zoom_level = this.model.tile_source.get_level_by_extent(extent, h, w);
    tiles = this.model.tile_source.get_tiles_by_extent(extent, zoom_level);
    results = [];
    for (t = i = 0, ref = Math.min(10, tiles.length); i <= ref; t = i += 1) {
      x = t[0], y = t[1], z = t[2], bounds = t[3];
      children = this.model.tile_source.children_by_tile_xyz(x, y, z);
      results.push((function() {
        var j, len, results1;
        results1 = [];
        for (j = 0, len = children.length; j < len; j++) {
          c = children[j];
          cx = c[0], cy = c[1], cz = c[2], cbounds = c[3];
          if (tile_source.tile_xyz_to_key(cx, cy, cz) in tile_source.tiles) {
            continue;
          } else {
            results1.push(this._create_tile(cx, cy, cz, cbounds, true));
          }
        }
        return results1;
      }).call(this));
    }
    return results;
  };

  TileRendererView.prototype._fetch_tiles = function(tiles) {
    var bounds, i, len, results, t, x, y, z;
    results = [];
    for (i = 0, len = tiles.length; i < len; i++) {
      t = tiles[i];
      x = t[0], y = t[1], z = t[2], bounds = t[3];
      results.push(this._create_tile(x, y, z, bounds));
    }
    return results;
  };

  TileRendererView.prototype._update = function() {
    var bounds, c, cached, cbounds, child_key, children, cx, cy, cz, extent, h, i, j, k, key, len, len1, len2, max_zoom, min_zoom, need_load, parent_key, parent_tile, parents, px, py, pz, ref, snap_back, t, tile, tile_source, tiles, w, x, y, z, zoom_level, zooming_out;
    tile_source = this.model.tile_source;
    min_zoom = tile_source.min_zoom;
    max_zoom = tile_source.max_zoom;
    tile_source.update();
    extent = this.get_extent();
    zooming_out = this.extent[2] - this.extent[0] < extent[2] - extent[0];
    h = this.map_frame.height;
    w = this.map_frame.width;
    zoom_level = tile_source.get_level_by_extent(extent, h, w);
    snap_back = false;
    if (zoom_level < min_zoom) {
      extent = this.extent;
      zoom_level = min_zoom;
      snap_back = true;
    } else if (zoom_level > max_zoom) {
      extent = this.extent;
      zoom_level = max_zoom;
      snap_back = true;
    }
    if (snap_back) {
      this.x_range.setv({
        x_range: {
          start: extent[0],
          end: extent[2]
        }
      });
      this.y_range.setv({
        start: extent[1],
        end: extent[3]
      });
      this.extent = extent;
    }
    this.extent = extent;
    tiles = tile_source.get_tiles_by_extent(extent, zoom_level);
    parents = [];
    need_load = [];
    cached = [];
    children = [];
    for (i = 0, len = tiles.length; i < len; i++) {
      t = tiles[i];
      x = t[0], y = t[1], z = t[2], bounds = t[3];
      key = tile_source.tile_xyz_to_key(x, y, z);
      tile = tile_source.tiles[key];
      if ((tile != null) && tile.loaded === true) {
        cached.push(key);
      } else {
        if (this.model.render_parents) {
          ref = tile_source.get_closest_parent_by_tile_xyz(x, y, z), px = ref[0], py = ref[1], pz = ref[2];
          parent_key = tile_source.tile_xyz_to_key(px, py, pz);
          parent_tile = tile_source.tiles[parent_key];
          if ((parent_tile != null) && parent_tile.loaded && indexOf.call(parents, parent_key) < 0) {
            parents.push(parent_key);
          }
          if (zooming_out) {
            children = tile_source.children_by_tile_xyz(x, y, z);
            for (j = 0, len1 = children.length; j < len1; j++) {
              c = children[j];
              cx = c[0], cy = c[1], cz = c[2], cbounds = c[3];
              child_key = tile_source.tile_xyz_to_key(cx, cy, cz);
              if (child_key in tile_source.tiles) {
                children.push(child_key);
              }
            }
          }
        }
      }
      if (tile == null) {
        need_load.push(t);
      }
    }
    this._render_tiles(parents);
    this._render_tiles(children);
    this._render_tiles(cached);
    for (k = 0, len2 = cached.length; k < len2; k++) {
      t = cached[k];
      tile_source.tiles[t].current = true;
    }
    if (this.render_timer != null) {
      clearTimeout(this.render_timer);
    }
    return this.render_timer = setTimeout(((function(_this) {
      return function() {
        return _this._fetch_tiles(need_load);
      };
    })(this)), 65);
  };

  return TileRendererView;

})(Renderer.View);

TileRenderer = (function(superClass) {
  extend(TileRenderer, superClass);

  function TileRenderer() {
    return TileRenderer.__super__.constructor.apply(this, arguments);
  }

  TileRenderer.prototype.default_view = TileRendererView;

  TileRenderer.prototype.type = 'TileRenderer';

  TileRenderer.define({
    alpha: [p.Number, 1.0],
    x_range_name: [p.String, "default"],
    y_range_name: [p.String, "default"],
    tile_source: [
      p.Instance, function() {
        return new wmts.Model();
      }
    ],
    render_parents: [p.Bool, true]
  });

  TileRenderer.override({
    level: 'underlay'
  });

  return TileRenderer;

})(Renderer.Model);

module.exports = {
  Model: TileRenderer,
  View: TileRendererView
};
