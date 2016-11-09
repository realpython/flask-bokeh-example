var $, Backbone, HasProps, _, array_max, logger, p, property_mixins, refs,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  slice = [].slice;

$ = require("jquery");

_ = require("underscore");

Backbone = require("./backbone");

logger = require("./logging").logger;

property_mixins = require("./property_mixins");

refs = require("./util/refs");

p = require("./properties");

array_max = require("./util/math").array_max;

HasProps = (function(superClass) {
  extend(HasProps, superClass);

  HasProps.prototype.props = {};

  HasProps.prototype.mixins = [];

  HasProps.define = function(object) {
    var name, prop, results;
    results = [];
    for (name in object) {
      prop = object[name];
      results.push((function(_this) {
        return function(name, prop) {
          var default_value, internal, props, refined_prop, type;
          if (_this.prototype.props[name] != null) {
            throw new Error("attempted to redefine property '" + _this.name + "." + name + "'");
          }
          if (_this.prototype[name] != null) {
            throw new Error("attempted to redefine attribute '" + _this.name + "." + name + "'");
          }
          Object.defineProperty(_this.prototype, name, {
            get: function() {
              return this.getv(name);
            },
            set: function(value) {
              return this.setv(name, value);
            }
          }, {
            configurable: false,
            enumerable: true
          });
          type = prop[0], default_value = prop[1], internal = prop[2];
          refined_prop = {
            type: type,
            default_value: default_value,
            internal: internal != null ? internal : false
          };
          props = _.clone(_this.prototype.props);
          props[name] = refined_prop;
          return _this.prototype.props = props;
        };
      })(this)(name, prop));
    }
    return results;
  };

  HasProps.internal = function(object) {
    var _object, fn, name, prop;
    _object = {};
    fn = (function(_this) {
      return function(name, prop) {
        var default_value, type;
        type = prop[0], default_value = prop[1];
        return _object[name] = [type, default_value, true];
      };
    })(this);
    for (name in object) {
      prop = object[name];
      fn(name, prop);
    }
    return this.define(_object);
  };

  HasProps.mixin = function() {
    var mixins, names;
    names = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    this.define(property_mixins.create(names));
    mixins = this.prototype.mixins.concat(names);
    return this.prototype.mixins = mixins;
  };

  HasProps.mixins = function(names) {
    return this.mixin.apply(this, names);
  };

  HasProps.override = function(name_or_object, default_value) {
    var name, object, results;
    if (_.isString(name_or_object)) {
      object = {};
      object[name] = default_value;
    } else {
      object = name_or_object;
    }
    results = [];
    for (name in object) {
      default_value = object[name];
      results.push((function(_this) {
        return function(name, default_value) {
          var props, value;
          value = _this.prototype.props[name];
          if (value == null) {
            throw new Error("attempted to override nonexistent '" + _this.name + "." + name + "'");
          }
          props = _.clone(_this.prototype.props);
          props[name] = _.extend({}, value, {
            default_value: default_value
          });
          return _this.prototype.props = props;
        };
      })(this)(name, default_value));
    }
    return results;
  };

  HasProps.define({
    id: [p.Any]
  });

  HasProps.prototype.toString = function() {
    return this.type + "(" + this.id + ")";
  };

  function HasProps(attributes, options) {
    var attrs, default_value, name, ref, ref1, type;
    this.document = null;
    attrs = attributes || {};
    if (!options) {
      options = {};
    }
    this.attributes = {};
    this.properties = {};
    ref = this.props;
    for (name in ref) {
      ref1 = ref[name], type = ref1.type, default_value = ref1.default_value;
      if (type == null) {
        throw new Error("undefined property type for " + this.type + "." + name);
      }
      this.properties[name] = new type({
        obj: this,
        attr: name,
        default_value: default_value
      });
    }
    this._set_after_defaults = {};
    this.setv(attrs, options);
    this.changed = {};
    this._computed = {};
    if (attrs.id == null) {
      this.id = _.uniqueId(this.type);
    }
    if (!options.defer_initialization) {
      this.initialize.apply(this, arguments);
    }
  }

  HasProps.prototype.setv = function(key, value, options) {
    var attrs, old, prop_name, results, val;
    if (_.isObject(key) || key === null) {
      attrs = key;
      options = value;
    } else {
      attrs = {};
      attrs[key] = value;
    }
    for (key in attrs) {
      if (!hasProp.call(attrs, key)) continue;
      val = attrs[key];
      prop_name = key;
      if (this.props[prop_name] == null) {
        throw new Error("property " + this.type + "." + prop_name + " wasn't declared");
      }
      if (!((options != null) && options.defaults)) {
        this._set_after_defaults[key] = true;
      }
    }
    if (!_.isEmpty(attrs)) {
      old = {};
      for (key in attrs) {
        value = attrs[key];
        old[key] = this.getv(key);
      }
      HasProps.__super__.setv.call(this, attrs, options);
      if ((options != null ? options.silent : void 0) == null) {
        results = [];
        for (key in attrs) {
          value = attrs[key];
          results.push(this._tell_document_about_change(key, old[key], this.getv(key)));
        }
        return results;
      }
    }
  };

  HasProps.prototype.add_dependencies = function(prop_name, object, fields) {
    var fld, j, len, prop_spec, results;
    if (!_.isArray(fields)) {
      fields = [fields];
    }
    prop_spec = this._computed[prop_name];
    prop_spec.dependencies = prop_spec.dependencies.concat({
      obj: object,
      fields: fields
    });
    results = [];
    for (j = 0, len = fields.length; j < len; j++) {
      fld = fields[j];
      results.push(this.listenTo(object, "change:" + fld, prop_spec['callbacks']['changedep']));
    }
    return results;
  };

  HasProps.prototype.define_computed_property = function(prop_name, getter, use_cache) {
    var changedep, prop_spec, propchange;
    if (use_cache == null) {
      use_cache = true;
    }
    if (this.props[prop_name] != null) {
      console.log("attempted to redefine existing property " + this.type + "." + prop_name);
    }
    if (_.has(this._computed, prop_name)) {
      throw new Error("attempted to redefine existing computed property " + this.type + "." + prop_name);
    }
    changedep = (function(_this) {
      return function() {
        return _this.trigger('changedep:' + prop_name);
      };
    })(this);
    propchange = (function(_this) {
      return function() {
        var firechange, new_val, old_val;
        firechange = true;
        if (prop_spec['use_cache']) {
          old_val = prop_spec.cache;
          prop_spec.cache = void 0;
          new_val = _this._get_computed(prop_name);
          firechange = new_val !== old_val;
        }
        if (firechange) {
          _this.trigger('change:' + prop_name, _this, _this._get_computed(prop_name));
          return _this.trigger('change', _this);
        }
      };
    })(this);
    prop_spec = {
      'getter': getter,
      'dependencies': [],
      'use_cache': use_cache,
      'callbacks': {
        changedep: changedep,
        propchange: propchange
      }
    };
    this._computed[prop_name] = prop_spec;
    this.listenTo(this, "changedep:" + prop_name, prop_spec['callbacks']['propchange']);
    return prop_spec;
  };

  HasProps.prototype.set = function(key, value, options) {
    logger.warn("HasProps.set('prop_name', value) is deprecated, use HasProps.prop_name = value instead");
    return this.setv(key, value, options);
  };

  HasProps.prototype.get = function(prop_name) {
    logger.warn("HasProps.get('prop_name') is deprecated, use HasProps.prop_name instead");
    return this.getv(prop_name);
  };

  HasProps.prototype.getv = function(prop_name) {
    if (this.props[prop_name] == null) {
      throw new Error("property " + this.type + "." + prop_name + " wasn't declared");
    } else {
      return HasProps.__super__.getv.call(this, prop_name);
    }
  };

  HasProps.prototype._get_computed = function(prop_name) {
    var computed, getter, prop_spec;
    prop_spec = this._computed[prop_name];
    if (prop_spec == null) {
      throw new Error("computed property " + this.type + "." + prop_name + " wasn't declared");
    }
    if (prop_spec.use_cache && prop_spec.cache) {
      return prop_spec.cache;
    } else {
      getter = prop_spec.getter;
      computed = getter.apply(this, [prop_name]);
      if (prop_spec.use_cache) {
        prop_spec.cache = computed;
      }
      return computed;
    }
  };

  HasProps.prototype.ref = function() {
    return refs.create_ref(this);
  };

  HasProps.prototype.set_subtype = function(subtype) {
    return this._subtype = subtype;
  };

  HasProps.prototype.attribute_is_serializable = function(attr) {
    var prop;
    prop = this.props[attr];
    if (prop == null) {
      throw new Error(this.type + ".attribute_is_serializable('" + attr + "'): " + attr + " wasn't declared");
    } else {
      return !prop.internal;
    }
  };

  HasProps.prototype.serializable_attributes = function() {
    var attrs, name, ref, value;
    attrs = {};
    ref = this.attributes;
    for (name in ref) {
      value = ref[name];
      if (this.attribute_is_serializable(name)) {
        attrs[name] = value;
      }
    }
    return attrs;
  };

  HasProps._value_to_json = function(key, value, optional_parent_object) {
    var i, j, len, ref_array, ref_obj, subkey, v;
    if (value instanceof HasProps) {
      return value.ref();
    } else if (_.isArray(value)) {
      ref_array = [];
      for (i = j = 0, len = value.length; j < len; i = ++j) {
        v = value[i];
        ref_array.push(HasProps._value_to_json(i, v, value));
      }
      return ref_array;
    } else if (_.isObject(value)) {
      ref_obj = {};
      for (subkey in value) {
        if (!hasProp.call(value, subkey)) continue;
        ref_obj[subkey] = HasProps._value_to_json(subkey, value[subkey], value);
      }
      return ref_obj;
    } else {
      return value;
    }
  };

  HasProps.prototype.attributes_as_json = function(include_defaults, value_to_json) {
    var attrs, key, ref, value;
    if (include_defaults == null) {
      include_defaults = true;
    }
    if (value_to_json == null) {
      value_to_json = HasProps._value_to_json;
    }
    attrs = {};
    ref = this.serializable_attributes();
    for (key in ref) {
      if (!hasProp.call(ref, key)) continue;
      value = ref[key];
      if (include_defaults) {
        attrs[key] = value;
      } else if (key in this._set_after_defaults) {
        attrs[key] = value;
      }
    }
    return value_to_json("attributes", attrs, this);
  };

  HasProps._json_record_references = function(doc, v, result, recurse) {
    var elem, j, k, len, model, results, results1;
    if (v === null) {

    } else if (refs.is_ref(v)) {
      if (!(v.id in result)) {
        model = doc.get_model_by_id(v.id);
        return HasProps._value_record_references(model, result, recurse);
      }
    } else if (_.isArray(v)) {
      results = [];
      for (j = 0, len = v.length; j < len; j++) {
        elem = v[j];
        results.push(HasProps._json_record_references(doc, elem, result, recurse));
      }
      return results;
    } else if (_.isObject(v)) {
      results1 = [];
      for (k in v) {
        if (!hasProp.call(v, k)) continue;
        elem = v[k];
        results1.push(HasProps._json_record_references(doc, elem, result, recurse));
      }
      return results1;
    }
  };

  HasProps._value_record_references = function(v, result, recurse) {
    var elem, immediate, j, k, l, len, len1, obj, results, results1, results2;
    if (v === null) {

    } else if (v instanceof HasProps) {
      if (!(v.id in result)) {
        result[v.id] = v;
        if (recurse) {
          immediate = v._immediate_references();
          results = [];
          for (j = 0, len = immediate.length; j < len; j++) {
            obj = immediate[j];
            results.push(HasProps._value_record_references(obj, result, true));
          }
          return results;
        }
      }
    } else if (_.isArray(v)) {
      results1 = [];
      for (l = 0, len1 = v.length; l < len1; l++) {
        elem = v[l];
        results1.push(HasProps._value_record_references(elem, result, recurse));
      }
      return results1;
    } else if (_.isObject(v)) {
      results2 = [];
      for (k in v) {
        if (!hasProp.call(v, k)) continue;
        elem = v[k];
        results2.push(HasProps._value_record_references(elem, result, recurse));
      }
      return results2;
    }
  };

  HasProps.prototype._immediate_references = function() {
    var attrs, key, result, value;
    result = {};
    attrs = this.serializable_attributes();
    for (key in attrs) {
      value = attrs[key];
      HasProps._value_record_references(value, result, false);
    }
    return _.values(result);
  };

  HasProps.prototype.references = function() {
    var references;
    references = {};
    HasProps._value_record_references(this, references, true);
    return _.values(references);
  };

  HasProps.prototype.attach_document = function(doc) {
    var name, prop, ref;
    if (this.document !== null && this.document !== doc) {
      throw new Error("models must be owned by only a single document");
    }
    this.document = doc;
    ref = this.properties;
    for (name in ref) {
      prop = ref[name];
      prop.update();
    }
    if (this._doc_attached != null) {
      return this._doc_attached();
    }
  };

  HasProps.prototype.detach_document = function() {
    return this.document = null;
  };

  HasProps.prototype._tell_document_about_change = function(attr, old, new_) {
    var need_invalidate, new_id, new_ref, new_refs, old_id, old_ref, old_refs;
    if (!this.attribute_is_serializable(attr)) {
      return;
    }
    if (this.document !== null) {
      new_refs = {};
      HasProps._value_record_references(new_, new_refs, false);
      old_refs = {};
      HasProps._value_record_references(old, old_refs, false);
      need_invalidate = false;
      for (new_id in new_refs) {
        new_ref = new_refs[new_id];
        if (!(new_id in old_refs)) {
          need_invalidate = true;
          break;
        }
      }
      if (!need_invalidate) {
        for (old_id in old_refs) {
          old_ref = old_refs[old_id];
          if (!(old_id in new_refs)) {
            need_invalidate = true;
            break;
          }
        }
      }
      if (need_invalidate) {
        this.document._invalidate_all_models();
      }
      return this.document._notify_change(this, attr, old, new_);
    }
  };

  HasProps.prototype.materialize_dataspecs = function(source) {
    var data, name, prop, ref;
    data = {};
    ref = this.properties;
    for (name in ref) {
      prop = ref[name];
      if (!prop.dataspec) {
        continue;
      }
      if ((prop.optional || false) && prop.spec.value === null && (!(name in this._set_after_defaults))) {
        continue;
      }
      data["_" + name] = prop.array(source);
      if (prop instanceof p.Distance) {
        data["max_" + name] = array_max(data["_" + name]);
      }
    }
    return data;
  };

  return HasProps;

})(Backbone.Model);

module.exports = HasProps;
