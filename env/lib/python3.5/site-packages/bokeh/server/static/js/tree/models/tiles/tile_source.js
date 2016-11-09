var ImagePool, Model, TileSource, _, logger, p, tile_utils,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

ImagePool = require("./image_pool");

tile_utils = require("./tile_utils");

logger = require("../../core/logging").logger;

p = require("../../core/properties");

Model = require("../../model");

TileSource = (function(superClass) {
  extend(TileSource, superClass);

  TileSource.prototype.type = 'TileSource';

  TileSource.define({
    url: [p.String, ''],
    tile_size: [p.Number, 256],
    max_zoom: [p.Number, 30],
    min_zoom: [p.Number, 0],
    extra_url_vars: [p.Any, {}],
    attribution: [p.String, ''],
    x_origin_offset: [p.Number],
    y_origin_offset: [p.Number],
    initial_resolution: [p.Number]
  });

  TileSource.prototype.initialize = function(options) {
    TileSource.__super__.initialize.call(this, options);
    return this.normalize_case();
  };

  function TileSource(options) {
    if (options == null) {
      options = {};
    }
    TileSource.__super__.constructor.apply(this, arguments);
    this.utils = new tile_utils.ProjectionUtils();
    this.pool = new ImagePool();
    this.tiles = {};
    this.normalize_case();
  }

  TileSource.prototype.string_lookup_replace = function(str, lookup) {
    var key, result_str, value;
    result_str = str;
    for (key in lookup) {
      value = lookup[key];
      result_str = result_str.replace('{' + key + '}', value.toString());
    }
    return result_str;
  };

  TileSource.prototype.normalize_case = function() {
    'Note: should probably be refactored into subclasses.';
    var url;
    url = this.url;
    url = url.replace('{x}', '{X}');
    url = url.replace('{y}', '{Y}');
    url = url.replace('{z}', '{Z}');
    url = url.replace('{q}', '{Q}');
    url = url.replace('{xmin}', '{XMIN}');
    url = url.replace('{ymin}', '{YMIN}');
    url = url.replace('{xmax}', '{XMAX}');
    url = url.replace('{ymax}', '{YMAX}');
    return this.url = url;
  };

  TileSource.prototype.update = function() {
    var key, ref, results, tile;
    logger.debug("TileSource: tile cache count: " + (Object.keys(this.tiles).length));
    ref = this.tiles;
    results = [];
    for (key in ref) {
      tile = ref[key];
      tile.current = false;
      results.push(tile.retain = false);
    }
    return results;
  };

  TileSource.prototype.tile_xyz_to_key = function(x, y, z) {
    var key;
    key = x + ":" + y + ":" + z;
    return key;
  };

  TileSource.prototype.key_to_tile_xyz = function(key) {
    var c;
    return (function() {
      var i, len, ref, results;
      ref = key.split(':');
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        c = ref[i];
        results.push(parseInt(c));
      }
      return results;
    })();
  };

  TileSource.prototype.sort_tiles_from_center = function(tiles, tile_extent) {
    var center_x, center_y, txmax, txmin, tymax, tymin;
    txmin = tile_extent[0], tymin = tile_extent[1], txmax = tile_extent[2], tymax = tile_extent[3];
    center_x = (txmax - txmin) / 2 + txmin;
    center_y = (tymax - tymin) / 2 + tymin;
    tiles.sort(function(a, b) {
      var a_distance, b_distance;
      a_distance = Math.sqrt(Math.pow(center_x - a[0], 2) + Math.pow(center_y - a[1], 2));
      b_distance = Math.sqrt(Math.pow(center_x - b[0], 2) + Math.pow(center_y - b[1], 2));
      return a_distance - b_distance;
    });
    return tiles;
  };

  TileSource.prototype.prune_tiles = function() {
    var key, ref, ref1, results, tile;
    ref = this.tiles;
    for (key in ref) {
      tile = ref[key];
      tile.retain = tile.current || tile.tile_coords[2] < 3;
      if (tile.current) {
        this.retain_neighbors(tile);
        this.retain_children(tile);
        this.retain_parents(tile);
      }
    }
    ref1 = this.tiles;
    results = [];
    for (key in ref1) {
      tile = ref1[key];
      if (!tile.retain) {
        results.push(this.remove_tile(key));
      } else {
        results.push(void 0);
      }
    }
    return results;
  };

  TileSource.prototype.remove_tile = function(key) {
    var tile;
    tile = this.tiles[key];
    if (tile != null) {
      this.pool.push(tile.img);
      return delete this.tiles[key];
    }
  };

  TileSource.prototype.get_image_url = function(x, y, z) {
    var image_url;
    image_url = this.string_lookup_replace(this.url, this.extra_url_vars);
    return image_url.replace("{X}", x).replace('{Y}', y).replace("{Z}", z);
  };

  TileSource.prototype.retain_neighbors = function(reference_tile) {
    throw Error("Not Implemented");
  };

  TileSource.prototype.retain_parents = function(reference_tile) {
    throw Error("Not Implemented");
  };

  TileSource.prototype.retain_children = function(reference_tile) {
    throw Error("Not Implemented");
  };

  TileSource.prototype.tile_xyz_to_quadkey = function(x, y, z) {
    throw Error("Not Implemented");
  };

  TileSource.prototype.quadkey_to_tile_xyz = function(quadkey) {
    throw Error("Not Implemented");
  };

  return TileSource;

})(Model);

module.exports = TileSource;
