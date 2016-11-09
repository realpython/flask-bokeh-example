var HasProps, SelectionManager, Selector, _, hittest, logger, p,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

HasProps = require("./has_props");

logger = require("./logging").logger;

Selector = require("./selector");

hittest = require("./hittest");

p = require("./properties");

SelectionManager = (function(superClass) {
  extend(SelectionManager, superClass);

  function SelectionManager() {
    return SelectionManager.__super__.constructor.apply(this, arguments);
  }

  SelectionManager.prototype.type = 'SelectionManager';

  SelectionManager.internal({
    source: [p.Any]
  });

  SelectionManager.prototype.initialize = function(attrs, options) {
    SelectionManager.__super__.initialize.call(this, attrs, options);
    this.selectors = {};
    this.inspectors = {};
    return this.last_inspection_was_empty = {};
  };

  SelectionManager.prototype.select = function(tool, renderer_view, geometry, final, append) {
    var indices, selector, source;
    if (append == null) {
      append = false;
    }
    source = this.source;
    if (source !== renderer_view.model.data_source) {
      logger.warn('select called with mis-matched data sources');
    }
    indices = renderer_view.hit_test(geometry);
    if (indices != null) {
      selector = this._get_selector(renderer_view);
      selector.update(indices, final, append);
      this.source.selected = selector.indices;
      source.trigger('select');
      source.trigger('select-' + renderer_view.model.id);
      return !indices.is_empty();
    } else {
      return false;
    }
  };

  SelectionManager.prototype.inspect = function(tool, renderer_view, geometry, data) {
    var indices, inspector, r_id, source;
    source = this.source;
    if (source !== renderer_view.model.data_source) {
      logger.warn('inspect called with mis-matched data sources');
    }
    indices = renderer_view.hit_test(geometry);
    if (indices != null) {
      r_id = renderer_view.model.id;
      if (indices.is_empty()) {
        if (this.last_inspection_was_empty[r_id] == null) {
          this.last_inspection_was_empty[r_id] = false;
        }
        if (this.last_inspection_was_empty[r_id]) {
          return;
        } else {
          this.last_inspection_was_empty[r_id] = true;
        }
      } else {
        this.last_inspection_was_empty[r_id] = false;
      }
      inspector = this._get_inspector(renderer_view);
      inspector.update(indices, true, false, true);
      this.source.setv({
        inspected: inspector.indices
      }, {
        "silent": true
      });
      source.trigger('inspect', indices, tool, renderer_view, source, data);
      source.trigger("inspect" + renderer_view.model.id, indices, tool, renderer_view, source, data);
      return !indices.is_empty();
    } else {
      return false;
    }
  };

  SelectionManager.prototype.clear = function(rview) {
    var k, ref, s, selector;
    if (rview != null) {
      selector = this._get_selector(rview);
      selector.clear();
    } else {
      ref = this.selectors;
      for (k in ref) {
        s = ref[k];
        s.clear();
      }
    }
    return this.source.selected = hittest.create_hit_test_result();
  };

  SelectionManager.prototype._get_selector = function(rview) {
    _.setdefault(this.selectors, rview.model.id, new Selector());
    return this.selectors[rview.model.id];
  };

  SelectionManager.prototype._get_inspector = function(rview) {
    _.setdefault(this.inspectors, rview.model.id, new Selector());
    return this.inspectors[rview.model.id];
  };

  return SelectionManager;

})(HasProps);

module.exports = SelectionManager;
