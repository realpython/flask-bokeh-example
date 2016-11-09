var ColumnDataSource, GeoJSONDataSource, _, logger, p,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

ColumnDataSource = require("./column_data_source");

logger = require("../../core/logging").logger;

p = require("../../core/properties");

GeoJSONDataSource = (function(superClass) {
  extend(GeoJSONDataSource, superClass);

  function GeoJSONDataSource() {
    return GeoJSONDataSource.__super__.constructor.apply(this, arguments);
  }

  GeoJSONDataSource.prototype.type = 'GeoJSONDataSource';

  GeoJSONDataSource.define({
    geojson: [p.Any]
  });

  GeoJSONDataSource.prototype.initialize = function(options) {
    GeoJSONDataSource.__super__.initialize.call(this, options);
    this._update_data();
    return this.listenTo(this, 'change:geojson', (function(_this) {
      return function() {
        return _this._update_data();
      };
    })(this));
  };

  GeoJSONDataSource.prototype._update_data = function() {
    return this.data = this.geojson_to_column_data();
  };

  GeoJSONDataSource.prototype._get_new_list_array = function(length) {
    var array, list_array;
    array = new Array(length);
    list_array = _.map(array, function(x) {
      return [];
    });
    return list_array;
  };

  GeoJSONDataSource.prototype._get_new_nan_array = function(length) {
    var array, nan_array;
    array = new Array(length);
    nan_array = _.map(array, function(x) {
      return 0/0;
    });
    return nan_array;
  };

  GeoJSONDataSource.prototype._flatten_function = function(accumulator, currentItem) {
    return accumulator.concat([[0/0, 0/0, 0/0]]).concat(currentItem);
  };

  GeoJSONDataSource.prototype._add_properties = function(item, data, i, item_count) {
    var property, results;
    results = [];
    for (property in item.properties) {
      if (!data.hasOwnProperty(property)) {
        data[property] = this._get_new_nan_array(item_count);
      }
      results.push(data[property][i] = item.properties[property]);
    }
    return results;
  };

  GeoJSONDataSource.prototype._add_geometry = function(geometry, data, i) {
    var coord_list, coords, exterior_ring, exterior_rings, flattened_coord_list, j, k, l, len, len1, len2, len3, len4, m, n, o, polygon, ref, ref1, ref2, ref3, ref4, ref5, results, results1, results2, results3;
    switch (geometry.type) {
      case "Point":
        coords = geometry.coordinates;
        data.x[i] = coords[0];
        data.y[i] = coords[1];
        return data.z[i] = (ref = coords[2]) != null ? ref : 0/0;
      case "LineString":
        coord_list = geometry.coordinates;
        results = [];
        for (j = k = 0, len = coord_list.length; k < len; j = ++k) {
          coords = coord_list[j];
          data.xs[i][j] = coords[0];
          data.ys[i][j] = coords[1];
          results.push(data.zs[i][j] = (ref1 = coords[2]) != null ? ref1 : 0/0);
        }
        return results;
        break;
      case "Polygon":
        if (geometry.coordinates.length > 1) {
          logger.warn('Bokeh does not support Polygons with holes in, only exterior ring used.');
        }
        exterior_ring = geometry.coordinates[0];
        results1 = [];
        for (j = l = 0, len1 = exterior_ring.length; l < len1; j = ++l) {
          coords = exterior_ring[j];
          data.xs[i][j] = coords[0];
          data.ys[i][j] = coords[1];
          results1.push(data.zs[i][j] = (ref2 = coords[2]) != null ? ref2 : 0/0);
        }
        return results1;
        break;
      case "MultiPoint":
        return logger.warn('MultiPoint not supported in Bokeh');
      case "MultiLineString":
        flattened_coord_list = _.reduce(geometry.coordinates, this._flatten_function);
        results2 = [];
        for (j = m = 0, len2 = flattened_coord_list.length; m < len2; j = ++m) {
          coords = flattened_coord_list[j];
          data.xs[i][j] = coords[0];
          data.ys[i][j] = coords[1];
          results2.push(data.zs[i][j] = (ref3 = coords[2]) != null ? ref3 : 0/0);
        }
        return results2;
        break;
      case "MultiPolygon":
        exterior_rings = [];
        ref4 = geometry.coordinates;
        for (n = 0, len3 = ref4.length; n < len3; n++) {
          polygon = ref4[n];
          if (polygon.length > 1) {
            logger.warn('Bokeh does not support Polygons with holes in, only exterior ring used.');
          }
          exterior_rings.push(polygon[0]);
        }
        flattened_coord_list = _.reduce(exterior_rings, this._flatten_function);
        results3 = [];
        for (j = o = 0, len4 = flattened_coord_list.length; o < len4; j = ++o) {
          coords = flattened_coord_list[j];
          data.xs[i][j] = coords[0];
          data.ys[i][j] = coords[1];
          results3.push(data.zs[i][j] = (ref5 = coords[2]) != null ? ref5 : 0/0);
        }
        return results3;
        break;
      default:
        throw new Error('Invalid type ' + geometry.type);
    }
  };

  GeoJSONDataSource.prototype._get_items_length = function(items) {
    var count, g, geometry, i, item, j, k, l, len, len1, ref;
    count = 0;
    for (i = k = 0, len = items.length; k < len; i = ++k) {
      item = items[i];
      geometry = item.type === 'Feature' ? item.geometry : item;
      if (geometry.type === 'GeometryCollection') {
        ref = geometry.geometries;
        for (j = l = 0, len1 = ref.length; l < len1; j = ++l) {
          g = ref[j];
          count += 1;
        }
      } else {
        count += 1;
      }
    }
    return count;
  };

  GeoJSONDataSource.prototype.geojson_to_column_data = function() {
    var arr_index, data, g, geojson, geometry, i, item, item_count, items, j, k, l, len, len1, ref, ref1;
    geojson = JSON.parse(this.geojson);
    if ((ref = geojson.type) !== 'GeometryCollection' && ref !== 'FeatureCollection') {
      throw new Error('Bokeh only supports type GeometryCollection and FeatureCollection at top level');
    }
    if (geojson.type === 'GeometryCollection') {
      if (geojson.geometries == null) {
        throw new Error('No geometries found in GeometryCollection');
      }
      if (geojson.geometries.length === 0) {
        throw new Error('geojson.geometries must have one or more items');
      }
      items = geojson.geometries;
    }
    if (geojson.type === 'FeatureCollection') {
      if (geojson.features == null) {
        throw new Error('No features found in FeaturesCollection');
      }
      if (geojson.features.length === 0) {
        throw new Error('geojson.features must have one or more items');
      }
      items = geojson.features;
    }
    item_count = this._get_items_length(items);
    data = {
      'x': this._get_new_nan_array(item_count),
      'y': this._get_new_nan_array(item_count),
      'z': this._get_new_nan_array(item_count),
      'xs': this._get_new_list_array(item_count),
      'ys': this._get_new_list_array(item_count),
      'zs': this._get_new_list_array(item_count)
    };
    arr_index = 0;
    for (i = k = 0, len = items.length; k < len; i = ++k) {
      item = items[i];
      geometry = item.type === 'Feature' ? item.geometry : item;
      if (geometry.type === 'GeometryCollection') {
        ref1 = geometry.geometries;
        for (j = l = 0, len1 = ref1.length; l < len1; j = ++l) {
          g = ref1[j];
          this._add_geometry(g, data, arr_index);
          if (item.type === 'Feature') {
            this._add_properties(item, data, arr_index, item_count);
          }
          arr_index += 1;
        }
      } else {
        this._add_geometry(geometry, data, arr_index);
        if (item.type === 'Feature') {
          this._add_properties(item, data, arr_index, item_count);
        }
        arr_index += 1;
      }
    }
    return data;
  };

  return GeoJSONDataSource;

})(ColumnDataSource.Model);

module.exports = {
  Model: GeoJSONDataSource
};
