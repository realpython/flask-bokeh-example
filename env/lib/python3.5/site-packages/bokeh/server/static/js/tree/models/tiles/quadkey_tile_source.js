var MercatorTileSource, QUADKEYTileSource,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

MercatorTileSource = require('./mercator_tile_source');

QUADKEYTileSource = (function(superClass) {
  extend(QUADKEYTileSource, superClass);

  function QUADKEYTileSource() {
    return QUADKEYTileSource.__super__.constructor.apply(this, arguments);
  }

  QUADKEYTileSource.prototype.type = 'QUADKEYTileSource';

  QUADKEYTileSource.prototype.get_image_url = function(x, y, z) {
    var image_url, quadKey, ref;
    image_url = this.string_lookup_replace(this.url, this.extra_url_vars);
    ref = this.tms_to_wmts(x, y, z), x = ref[0], y = ref[1], z = ref[2];
    quadKey = this.tile_xyz_to_quadkey(x, y, z);
    return image_url.replace("{Q}", quadKey);
  };

  return QUADKEYTileSource;

})(MercatorTileSource);

module.exports = {
  Model: QUADKEYTileSource
};
