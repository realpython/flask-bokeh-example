var MercatorTileSource, TMSTileSource,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

MercatorTileSource = require('./mercator_tile_source');

TMSTileSource = (function(superClass) {
  extend(TMSTileSource, superClass);

  function TMSTileSource() {
    return TMSTileSource.__super__.constructor.apply(this, arguments);
  }

  TMSTileSource.prototype.type = 'TMSTileSource';

  TMSTileSource.prototype.get_image_url = function(x, y, z) {
    var image_url;
    image_url = this.string_lookup_replace(this.url, this.extra_url_vars);
    return image_url.replace("{X}", x).replace('{Y}', y).replace("{Z}", z);
  };

  return TMSTileSource;

})(MercatorTileSource);

module.exports = {
  Model: TMSTileSource
};
