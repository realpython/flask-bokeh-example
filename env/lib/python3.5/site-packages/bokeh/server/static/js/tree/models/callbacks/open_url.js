var Model, OpenURL, _, get_indices, p, replace_placeholders,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

Model = require("../../model");

p = require("../../core/properties");

get_indices = require("../../core/util/selection").get_indices;

replace_placeholders = require("../../core/util/templating").replace_placeholders;

OpenURL = (function(superClass) {
  extend(OpenURL, superClass);

  function OpenURL() {
    return OpenURL.__super__.constructor.apply(this, arguments);
  }

  OpenURL.prototype.type = 'OpenURL';

  OpenURL.define({
    url: [p.String, 'http://']
  });

  OpenURL.prototype.execute = function(data_source) {
    var i, j, len, ref, url;
    ref = get_indices(data_source);
    for (j = 0, len = ref.length; j < len; j++) {
      i = ref[j];
      url = replace_placeholders(this.url, data_source, i);
      window.open(url);
    }
    return null;
  };

  return OpenURL;

})(Model);

module.exports = {
  Model: OpenURL
};
