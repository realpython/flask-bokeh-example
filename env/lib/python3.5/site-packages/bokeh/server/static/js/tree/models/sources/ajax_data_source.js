var $, AjaxDataSource, RemoteDataSource, _, logger, p,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

$ = require("jquery");

_ = require("underscore");

RemoteDataSource = require("./remote_data_source");

logger = require("../../core/logging").logger;

p = require("../../core/properties");

AjaxDataSource = (function(superClass) {
  extend(AjaxDataSource, superClass);

  function AjaxDataSource() {
    this.get_data = bind(this.get_data, this);
    this.setup = bind(this.setup, this);
    this.destroy = bind(this.destroy, this);
    return AjaxDataSource.__super__.constructor.apply(this, arguments);
  }

  AjaxDataSource.prototype.type = 'AjaxDataSource';

  AjaxDataSource.define({
    mode: [p.String, 'replace'],
    content_type: [p.String, 'application/json'],
    http_headers: [p.Any, {}],
    max_size: [p.Number],
    method: [p.String, 'POST'],
    if_modified: [p.Bool, false]
  });

  AjaxDataSource.prototype.destroy = function() {
    if (this.interval != null) {
      return clearInterval(this.interval);
    }
  };

  AjaxDataSource.prototype.setup = function(plot_view, glyph) {
    this.pv = plot_view;
    this.get_data(this.mode);
    if (this.polling_interval) {
      return this.interval = setInterval(this.get_data, this.polling_interval, this.mode, this.max_size, this.if_modified);
    }
  };

  AjaxDataSource.prototype.get_data = function(mode, max_size, if_modified) {
    if (max_size == null) {
      max_size = 0;
    }
    if (if_modified == null) {
      if_modified = false;
    }
    $.ajax({
      dataType: 'json',
      ifModified: if_modified,
      url: this.data_url,
      xhrField: {
        withCredentials: true
      },
      method: this.method,
      contentType: this.content_type,
      headers: this.http_headers
    }).done((function(_this) {
      return function(data) {
        var column, i, len, original_data, ref;
        if (mode === 'replace') {
          _this.data = data;
        } else if (mode === 'append') {
          original_data = _this.data;
          ref = _this.columns();
          for (i = 0, len = ref.length; i < len; i++) {
            column = ref[i];
            data[column] = original_data[column].concat(data[column]).slice(-max_size);
          }
          _this.data = data;
        } else {
          logger.error("unsupported mode: " + mode);
        }
        logger.trace(data);
        return null;
      };
    })(this)).error(function() {
      return logger.error(arguments);
    });
    return null;
  };

  return AjaxDataSource;

})(RemoteDataSource.Model);

module.exports = {
  Model: AjaxDataSource
};
