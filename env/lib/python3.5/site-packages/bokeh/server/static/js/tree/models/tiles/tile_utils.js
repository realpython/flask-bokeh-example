var ProjectionUtils, mercator, proj4, wgs84;

proj4 = require("../../core/util/proj4");

mercator = proj4.defs('GOOGLE');

wgs84 = proj4.defs('WGS84');

ProjectionUtils = (function() {
  function ProjectionUtils() {
    this.origin_shift = 2 * Math.PI * 6378137 / 2.0;
  }

  ProjectionUtils.prototype.geographic_to_meters = function(xLon, yLat) {
    return proj4(wgs84, mercator, [xLon, yLat]);
  };

  ProjectionUtils.prototype.meters_to_geographic = function(mx, my) {
    return proj4(mercator, wgs84, [mx, my]);
  };

  ProjectionUtils.prototype.geographic_extent_to_meters = function(extent) {
    var ref, ref1, xmax, xmin, ymax, ymin;
    xmin = extent[0], ymin = extent[1], xmax = extent[2], ymax = extent[3];
    ref = this.geographic_to_meters(xmin, ymin), xmin = ref[0], ymin = ref[1];
    ref1 = this.geographic_to_meters(xmax, ymax), xmax = ref1[0], ymax = ref1[1];
    return [xmin, ymin, xmax, ymax];
  };

  ProjectionUtils.prototype.meters_extent_to_geographic = function(extent) {
    var ref, ref1, xmax, xmin, ymax, ymin;
    xmin = extent[0], ymin = extent[1], xmax = extent[2], ymax = extent[3];
    ref = this.meters_to_geographic(xmin, ymin), xmin = ref[0], ymin = ref[1];
    ref1 = this.meters_to_geographic(xmax, ymax), xmax = ref1[0], ymax = ref1[1];
    return [xmin, ymin, xmax, ymax];
  };

  return ProjectionUtils;

})();

module.exports = {
  ProjectionUtils: ProjectionUtils
};
