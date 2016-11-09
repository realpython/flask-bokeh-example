var BBoxTileSource, MercatorTileSource, _, p,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

MercatorTileSource = require('./mercator_tile_source');

p = require("../../core/properties");

BBoxTileSource = (function(superClass) {
  extend(BBoxTileSource, superClass);

  function BBoxTileSource() {
    return BBoxTileSource.__super__.constructor.apply(this, arguments);
  }

  BBoxTileSource.prototype.type = 'BBoxTileSource';

  BBoxTileSource.define({
    use_latlon: [p.Bool, false]
  });

  BBoxTileSource.prototype.get_image_url = function(x, y, z) {
    var image_url, ref, ref1, xmax, xmin, ymax, ymin;
    image_url = this.string_lookup_replace(this.url, this.extra_url_vars);
    if (this.use_latlon) {
      ref = this.get_tile_geographic_bounds(x, y, z), xmin = ref[0], ymin = ref[1], xmax = ref[2], ymax = ref[3];
    } else {
      ref1 = this.get_tile_meter_bounds(x, y, z), xmin = ref1[0], ymin = ref1[1], xmax = ref1[2], ymax = ref1[3];
    }
    return image_url.replace("{XMIN}", xmin).replace("{YMIN}", ymin).replace("{XMAX}", xmax).replace("{YMAX}", ymax);
  };

  return BBoxTileSource;

})(MercatorTileSource);

module.exports = {
  Model: BBoxTileSource
};
