var MercatorTileSource, TileSource, _, p,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

TileSource = require("./tile_source");

p = require("../../core/properties");

MercatorTileSource = (function(superClass) {
  extend(MercatorTileSource, superClass);

  function MercatorTileSource() {
    return MercatorTileSource.__super__.constructor.apply(this, arguments);
  }

  MercatorTileSource.prototype.type = 'MercatorTileSource';

  MercatorTileSource.define({
    wrap_around: [p.Bool, true]
  });

  MercatorTileSource.override({
    x_origin_offset: 20037508.34,
    y_origin_offset: 20037508.34,
    initial_resolution: 156543.03392804097
  });

  MercatorTileSource.prototype.initialize = function(options) {
    var z;
    MercatorTileSource.__super__.initialize.call(this, options);
    return this._resolutions = (function() {
      var j, results;
      results = [];
      for (z = j = 0; j <= 30; z = ++j) {
        results.push(this.get_resolution(z));
      }
      return results;
    }).call(this);
  };

  MercatorTileSource.prototype._computed_initial_resolution = function() {
    if (this.initial_resolution != null) {
      return this.initial_resolution;
    } else {
      return 2 * Math.PI * 6378137 / this.tile_size;
    }
  };

  MercatorTileSource.prototype.is_valid_tile = function(x, y, z) {
    if (!this.wrap_around) {
      if (x < 0 || x >= Math.pow(2, z)) {
        return false;
      }
    }
    if (y < 0 || y >= Math.pow(2, z)) {
      return false;
    }
    return true;
  };

  MercatorTileSource.prototype.retain_children = function(reference_tile) {
    var key, max_zoom, min_zoom, quadkey, ref, results, tile;
    quadkey = reference_tile.quadkey;
    min_zoom = quadkey.length;
    max_zoom = min_zoom + 3;
    ref = this.tiles;
    results = [];
    for (key in ref) {
      tile = ref[key];
      if (tile.quadkey.indexOf(quadkey) === 0 && tile.quadkey.length > min_zoom && tile.quadkey.length <= max_zoom) {
        results.push(tile.retain = true);
      } else {
        results.push(void 0);
      }
    }
    return results;
  };

  MercatorTileSource.prototype.retain_neighbors = function(reference_tile) {
    var key, neighbor_radius, neighbor_x, neighbor_y, ref, ref1, results, tile, tx, ty, tz, x, y;
    neighbor_radius = 4;
    ref = reference_tile.tile_coords, tx = ref[0], ty = ref[1], tz = ref[2];
    neighbor_x = (function() {
      var j, ref1, ref2, results;
      results = [];
      for (x = j = ref1 = tx - neighbor_radius, ref2 = tx + neighbor_radius; ref1 <= ref2 ? j <= ref2 : j >= ref2; x = ref1 <= ref2 ? ++j : --j) {
        results.push(x);
      }
      return results;
    })();
    neighbor_y = (function() {
      var j, ref1, ref2, results;
      results = [];
      for (y = j = ref1 = ty - neighbor_radius, ref2 = ty + neighbor_radius; ref1 <= ref2 ? j <= ref2 : j >= ref2; y = ref1 <= ref2 ? ++j : --j) {
        results.push(y);
      }
      return results;
    })();
    ref1 = this.tiles;
    results = [];
    for (key in ref1) {
      tile = ref1[key];
      if (tile.tile_coords[2] === tz && _.contains(neighbor_x, tile.tile_coords[0]) && _.contains(neighbor_y, tile.tile_coords[1])) {
        results.push(tile.retain = true);
      } else {
        results.push(void 0);
      }
    }
    return results;
  };

  MercatorTileSource.prototype.retain_parents = function(reference_tile) {
    var key, quadkey, ref, results, tile;
    quadkey = reference_tile.quadkey;
    ref = this.tiles;
    results = [];
    for (key in ref) {
      tile = ref[key];
      results.push(tile.retain = quadkey.indexOf(tile.quadkey) === 0);
    }
    return results;
  };

  MercatorTileSource.prototype.children_by_tile_xyz = function(x, y, z) {
    var b, child_tile_xyz, i, j, quad_key, ref, ref1, ref2, world_x;
    world_x = this.calculate_world_x_by_tile_xyz(x, y, z);
    if (world_x !== 0) {
      ref = this.normalize_xyz(x, y, z), x = ref[0], y = ref[1], z = ref[2];
    }
    quad_key = this.tile_xyz_to_quadkey(x, y, z);
    child_tile_xyz = [];
    for (i = j = 0; j <= 3; i = j += 1) {
      ref1 = this.quadkey_to_tile_xyz(quad_key + i.toString()), x = ref1[0], y = ref1[1], z = ref1[2];
      if (world_x !== 0) {
        ref2 = this.denormalize_xyz(x, y, z, world_x), x = ref2[0], y = ref2[1], z = ref2[2];
      }
      b = this.get_tile_meter_bounds(x, y, z);
      if (b != null) {
        child_tile_xyz.push([x, y, z, b]);
      }
    }
    return child_tile_xyz;
  };

  MercatorTileSource.prototype.parent_by_tile_xyz = function(x, y, z) {
    var parent_quad_key, quad_key;
    quad_key = this.tile_xyz_to_quadkey(x, y, z);
    parent_quad_key = quad_key.substring(0, quad_key.length - 1);
    return this.quadkey_to_tile_xyz(parent_quad_key);
  };

  MercatorTileSource.prototype.get_resolution = function(level) {
    return this._computed_initial_resolution() / Math.pow(2, level);
  };

  MercatorTileSource.prototype.get_resolution_by_extent = function(extent, height, width) {
    var x_rs, y_rs;
    x_rs = (extent[2] - extent[0]) / width;
    y_rs = (extent[3] - extent[1]) / height;
    return [x_rs, y_rs];
  };

  MercatorTileSource.prototype.get_level_by_extent = function(extent, height, width) {
    var i, j, len, r, ref, resolution, x_rs, y_rs;
    x_rs = (extent[2] - extent[0]) / width;
    y_rs = (extent[3] - extent[1]) / height;
    resolution = Math.max(x_rs, y_rs);
    i = 0;
    ref = this._resolutions;
    for (j = 0, len = ref.length; j < len; j++) {
      r = ref[j];
      if (resolution > r) {
        if (i === 0) {
          return 0;
        }
        if (i > 0) {
          return i - 1;
        }
      }
      i += 1;
    }
  };

  MercatorTileSource.prototype.get_closest_level_by_extent = function(extent, height, width) {
    var closest, resolution, ress, x_rs, y_rs;
    x_rs = (extent[2] - extent[0]) / width;
    y_rs = (extent[3] - extent[1]) / height;
    resolution = Math.max(x_rs, y_rs);
    ress = this._resolutions;
    closest = this._resolutions.reduce(function(previous, current) {
      if (Math.abs(current - resolution) < Math.abs(previous - resolution)) {
        return current;
      }
      return previous;
    });
    return this._resolutions.indexOf(closest);
  };

  MercatorTileSource.prototype.snap_to_zoom = function(extent, height, width, level) {
    var desired_res, desired_x_delta, desired_y_delta, x_adjust, xmax, xmin, y_adjust, ymax, ymin;
    desired_res = this._resolutions[level];
    desired_x_delta = width * desired_res;
    desired_y_delta = height * desired_res;
    xmin = extent[0], ymin = extent[1], xmax = extent[2], ymax = extent[3];
    x_adjust = (desired_x_delta - (xmax - xmin)) / 2;
    y_adjust = (desired_y_delta - (ymax - ymin)) / 2;
    return [xmin - x_adjust, ymin - y_adjust, xmax + x_adjust, ymax + y_adjust];
  };

  MercatorTileSource.prototype.tms_to_wmts = function(x, y, z) {
    'Note this works both ways';
    return [x, Math.pow(2, z) - 1 - y, z];
  };

  MercatorTileSource.prototype.wmts_to_tms = function(x, y, z) {
    'Note this works both ways';
    return [x, Math.pow(2, z) - 1 - y, z];
  };

  MercatorTileSource.prototype.pixels_to_meters = function(px, py, level) {
    var mx, my, res;
    res = this.get_resolution(level);
    mx = px * res - this.x_origin_offset;
    my = py * res - this.y_origin_offset;
    return [mx, my];
  };

  MercatorTileSource.prototype.meters_to_pixels = function(mx, my, level) {
    var px, py, res;
    res = this.get_resolution(level);
    px = (mx + this.x_origin_offset) / res;
    py = (my + this.y_origin_offset) / res;
    return [px, py];
  };

  MercatorTileSource.prototype.pixels_to_tile = function(px, py) {
    var tx, ty;
    tx = Math.ceil(px / parseFloat(this.tile_size));
    tx = tx === 0 ? tx : tx - 1;
    ty = Math.max(Math.ceil(py / parseFloat(this.tile_size)) - 1, 0);
    return [tx, ty];
  };

  MercatorTileSource.prototype.pixels_to_raster = function(px, py, level) {
    var mapSize;
    mapSize = this.tile_size << level;
    return [px, mapSize - py];
  };

  MercatorTileSource.prototype.meters_to_tile = function(mx, my, level) {
    var px, py, ref;
    ref = this.meters_to_pixels(mx, my, level), px = ref[0], py = ref[1];
    return this.pixels_to_tile(px, py);
  };

  MercatorTileSource.prototype.get_tile_meter_bounds = function(tx, ty, level) {
    var ref, ref1, xmax, xmin, ymax, ymin;
    ref = this.pixels_to_meters(tx * this.tile_size, ty * this.tile_size, level), xmin = ref[0], ymin = ref[1];
    ref1 = this.pixels_to_meters((tx + 1) * this.tile_size, (ty + 1) * this.tile_size, level), xmax = ref1[0], ymax = ref1[1];
    if ((xmin != null) && (ymin != null) && (xmax != null) && (ymax != null)) {
      return [xmin, ymin, xmax, ymax];
    } else {
      return void 0;
    }
  };

  MercatorTileSource.prototype.get_tile_geographic_bounds = function(tx, ty, level) {
    var bounds, maxLat, maxLon, minLat, minLon, ref;
    bounds = this.get_tile_meter_bounds(tx, ty, level);
    ref = this.utils.meters_extent_to_geographic(bounds), minLon = ref[0], minLat = ref[1], maxLon = ref[2], maxLat = ref[3];
    return [minLon, minLat, maxLon, maxLat];
  };

  MercatorTileSource.prototype.get_tiles_by_extent = function(extent, level, tile_border) {
    var j, k, ref, ref1, ref2, ref3, ref4, ref5, tiles, tx, txmax, txmin, ty, tymax, tymin, xmax, xmin, ymax, ymin;
    if (tile_border == null) {
      tile_border = 1;
    }
    xmin = extent[0], ymin = extent[1], xmax = extent[2], ymax = extent[3];
    ref = this.meters_to_tile(xmin, ymin, level), txmin = ref[0], tymin = ref[1];
    ref1 = this.meters_to_tile(xmax, ymax, level), txmax = ref1[0], tymax = ref1[1];
    txmin -= tile_border;
    tymin -= tile_border;
    txmax += tile_border;
    tymax += tile_border;
    tiles = [];
    for (ty = j = ref2 = tymax, ref3 = tymin; j >= ref3; ty = j += -1) {
      for (tx = k = ref4 = txmin, ref5 = txmax; k <= ref5; tx = k += 1) {
        if (this.is_valid_tile(tx, ty, level)) {
          tiles.push([tx, ty, level, this.get_tile_meter_bounds(tx, ty, level)]);
        }
      }
    }
    tiles = this.sort_tiles_from_center(tiles, [txmin, tymin, txmax, tymax]);
    return tiles;
  };

  MercatorTileSource.prototype.quadkey_to_tile_xyz = function(quadKey) {
    'Computes tile x, y and z values based on quadKey.';
    var i, j, mask, ref, tileX, tileY, tileZ, value;
    tileX = 0;
    tileY = 0;
    tileZ = quadKey.length;
    for (i = j = ref = tileZ; j > 0; i = j += -1) {
      value = quadKey.charAt(tileZ - i);
      mask = 1 << (i - 1);
      switch (value) {
        case '0':
          continue;
        case '1':
          tileX |= mask;
          break;
        case '2':
          tileY |= mask;
          break;
        case '3':
          tileX |= mask;
          tileY |= mask;
          break;
        default:
          throw new TypeError("Invalid Quadkey: " + quadKey);
      }
    }
    return [tileX, tileY, tileZ];
  };

  MercatorTileSource.prototype.tile_xyz_to_quadkey = function(x, y, z) {
    'Computes quadkey value based on tile x, y and z values.';
    var digit, i, j, mask, quadKey, ref;
    quadKey = '';
    for (i = j = ref = z; j > 0; i = j += -1) {
      digit = 0;
      mask = 1 << (i - 1);
      if ((x & mask) !== 0) {
        digit += 1;
      }
      if ((y & mask) !== 0) {
        digit += 2;
      }
      quadKey += digit.toString();
    }
    return quadKey;
  };

  MercatorTileSource.prototype.children_by_tile_xyz = function(x, y, z) {
    var b, child_tile_xyz, i, j, quad_key, ref;
    quad_key = this.tile_xyz_to_quadkey(x, y, z);
    child_tile_xyz = [];
    for (i = j = 0; j <= 3; i = j += 1) {
      ref = this.quadkey_to_tile_xyz(quad_key + i.toString()), x = ref[0], y = ref[1], z = ref[2];
      b = this.get_tile_meter_bounds(x, y, z);
      if (b != null) {
        child_tile_xyz.push([x, y, z, b]);
      }
    }
    return child_tile_xyz;
  };

  MercatorTileSource.prototype.parent_by_tile_xyz = function(x, y, z) {
    var parent_quad_key, quad_key;
    quad_key = this.tile_xyz_to_quadkey(x, y, z);
    parent_quad_key = quad_key.substring(0, quad_key.length - 1);
    return this.quadkey_to_tile_xyz(parent_quad_key);
  };

  MercatorTileSource.prototype.get_closest_parent_by_tile_xyz = function(x, y, z) {
    var quad_key, ref, ref1, ref2, world_x;
    world_x = this.calculate_world_x_by_tile_xyz(x, y, z);
    ref = this.normalize_xyz(x, y, z), x = ref[0], y = ref[1], z = ref[2];
    quad_key = this.tile_xyz_to_quadkey(x, y, z);
    while (quad_key.length > 0) {
      quad_key = quad_key.substring(0, quad_key.length - 1);
      ref1 = this.quadkey_to_tile_xyz(quad_key), x = ref1[0], y = ref1[1], z = ref1[2];
      ref2 = this.denormalize_xyz(x, y, z, world_x), x = ref2[0], y = ref2[1], z = ref2[2];
      if (this.tile_xyz_to_key(x, y, z) in this.tiles) {
        return [x, y, z];
      }
    }
    return [0, 0, 0];
  };

  MercatorTileSource.prototype.normalize_xyz = function(x, y, z) {
    var tile_count;
    if (this.wrap_around) {
      tile_count = Math.pow(2, z);
      return [((x % tile_count) + tile_count) % tile_count, y, z];
    } else {
      return [x, y, z];
    }
  };

  MercatorTileSource.prototype.denormalize_xyz = function(x, y, z, world_x) {
    return [x + world_x * Math.pow(2, z), y, z];
  };

  MercatorTileSource.prototype.denormalize_meters = function(meters_x, meters_y, level, world_x) {
    return [meters_x + world_x * 2 * Math.PI * 6378137, meters_y];
  };

  MercatorTileSource.prototype.calculate_world_x_by_tile_xyz = function(x, y, z) {
    return Math.floor(x / Math.pow(2, z));
  };

  return MercatorTileSource;

})(TileSource);

module.exports = MercatorTileSource;
