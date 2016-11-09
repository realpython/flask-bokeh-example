var ColumnDataSource, LegendItem, Model, _, logger, p,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

_ = require("underscore");

Model = require("../../model");

p = require("../../core/properties");

logger = require("../../core/logging").logger;

ColumnDataSource = require("../../models/sources/column_data_source");

LegendItem = (function(superClass) {
  extend(LegendItem, superClass);

  function LegendItem() {
    this.get_labels_list_from_label_prop = bind(this.get_labels_list_from_label_prop, this);
    this.get_field_from_label_prop = bind(this.get_field_from_label_prop, this);
    return LegendItem.__super__.constructor.apply(this, arguments);
  }

  LegendItem.prototype.type = "LegendItem";

  LegendItem.prototype._check_data_sources_on_renderers = function() {
    var field, i, len, r, ref, source;
    field = this.get_field_from_label_prop();
    if (field != null) {
      if (this.renderers.length < 1) {
        return false;
      }
      source = this.renderers[0].data_source;
      if (source != null) {
        ref = this.renderers;
        for (i = 0, len = ref.length; i < len; i++) {
          r = ref[i];
          if (r.data_source !== source) {
            return false;
          }
        }
      }
    }
    return true;
  };

  LegendItem.prototype._check_field_label_on_data_source = function() {
    var field, source;
    field = this.get_field_from_label_prop();
    if (field != null) {
      if (this.renderers.length < 1) {
        return false;
      }
      source = this.renderers[0].data_source;
      if ((source != null) && indexOf.call(source.columns(), field) < 0) {
        return false;
      }
    }
    return true;
  };

  LegendItem.prototype.initialize = function(attrs, options) {
    var data_source_validation, field_validation;
    LegendItem.__super__.initialize.call(this, attrs, options);
    data_source_validation = this._check_data_sources_on_renderers();
    if (!data_source_validation) {
      logger.error("Non matching data sources on legend item renderers");
    }
    field_validation = this._check_field_label_on_data_source();
    if (!field_validation) {
      return logger.error("Bad column name on label: " + this.label);
    }
  };

  LegendItem.define({
    label: [p.StringSpec, null],
    renderers: [p.Array, []]
  });

  LegendItem.prototype.get_field_from_label_prop = function() {
    if ((this.label != null) && (this.label.field != null)) {
      return this.label.field;
    }
  };

  LegendItem.prototype.get_labels_list_from_label_prop = function() {
    var data, field, source;
    if ((this.label != null) && (this.label.value != null)) {
      return [this.label.value];
    }
    field = this.get_field_from_label_prop();
    if (field != null) {
      if (this.renderers[0] && (this.renderers[0].data_source != null)) {
        source = this.renderers[0].data_source;
      } else {
        return ["No source found"];
      }
      if (source instanceof ColumnDataSource.Model) {
        data = source.get_column(field);
        if (data != null) {
          return _.unique(data);
        } else {
          return ["Invalid field"];
        }
      }
    }
    return [];
  };

  return LegendItem;

})(Model);

module.exports = {
  Model: LegendItem
};
