var ImageSource, Model, _, logger, p,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

logger = require("../../core/logging").logger;

p = require("../../core/properties");

Model = require("../../model");

ImageSource = (function(superClass) {
  extend(ImageSource, superClass);

  ImageSource.prototype.type = 'ImageSource';

  ImageSource.define({
    url: [p.String, ''],
    extra_url_vars: [p.Any, {}]
  });

  function ImageSource(options) {
    if (options == null) {
      options = {};
    }
    ImageSource.__super__.constructor.apply(this, arguments);
    this.images = {};
    this.normalize_case();
  }

  ImageSource.prototype.normalize_case = function() {
    'Note: should probably be refactored into subclasses.';
    var url;
    url = this.url;
    url = url.replace('{xmin}', '{XMIN}');
    url = url.replace('{ymin}', '{YMIN}');
    url = url.replace('{xmax}', '{XMAX}');
    url = url.replace('{ymax}', '{YMAX}');
    url = url.replace('{height}', '{HEIGHT}');
    url = url.replace('{width}', '{WIDTH}');
    return this.url = url;
  };

  ImageSource.prototype.string_lookup_replace = function(str, lookup) {
    var key, result_str, value;
    result_str = str;
    for (key in lookup) {
      value = lookup[key];
      result_str = result_str.replace('{' + key + '}', value.toString());
    }
    return result_str;
  };

  ImageSource.prototype.add_image = function(image_obj) {
    return this.images[image_obj.cache_key] = image_obj;
  };

  ImageSource.prototype.remove_image = function(image_obj) {
    return delete this.images[image_obj.cache_key];
  };

  ImageSource.prototype.get_image_url = function(xmin, ymin, xmax, ymax, height, width) {
    var image_url;
    image_url = this.string_lookup_replace(this.url, this.extra_url_vars);
    return image_url.replace("{XMIN}", xmin).replace("{YMIN}", ymin).replace("{XMAX}", xmax).replace("{YMAX}", ymax).replace("{WIDTH}", width).replace("{HEIGHT}", height);
  };

  return ImageSource;

})(Model);

module.exports = {
  Model: ImageSource
};
