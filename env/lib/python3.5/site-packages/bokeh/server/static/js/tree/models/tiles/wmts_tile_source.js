var MercatorTileSource, WMTSTileSource,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

MercatorTileSource = require('./mercator_tile_source');

WMTSTileSource = (function(superClass) {
  extend(WMTSTileSource, superClass);

  function WMTSTileSource() {
    return WMTSTileSource.__super__.constructor.apply(this, arguments);
  }

  WMTSTileSource.prototype.type = 'WMTSTileSource';

  WMTSTileSource.prototype.get_image_url = function(x, y, z) {
    var image_url, ref;
    image_url = this.string_lookup_replace(this.url, this.extra_url_vars);
    ref = this.tms_to_wmts(x, y, z), x = ref[0], y = ref[1], z = ref[2];
    return image_url.replace("{X}", x).replace('{Y}', y).replace("{Z}", z);
  };

  return WMTSTileSource;

})(MercatorTileSource);

module.exports = {
  Model: WMTSTileSource
};
