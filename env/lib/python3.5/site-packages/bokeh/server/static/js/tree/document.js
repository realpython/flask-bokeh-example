var $, ColumnDataSource, DEFAULT_TITLE, Document, DocumentChangedEvent, EQ, HasProps, ModelChangedEvent, Models, MultiDict, RootAddedEvent, RootRemovedEvent, Set, Solver, TitleChangedEvent, Variable, _, is_ref, js_version, logger, ref1, ref2,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

_ = require("underscore");

$ = require("jquery");

Models = require("./base").Models;

js_version = require("./version");

ref1 = require("./core/layout/solver"), EQ = ref1.EQ, Solver = ref1.Solver, Variable = ref1.Variable;

logger = require("./core/logging").logger;

HasProps = require("./core/has_props");

is_ref = require("./core/util/refs").is_ref;

ref2 = require("./core/util/data_structures"), MultiDict = ref2.MultiDict, Set = ref2.Set;

ColumnDataSource = require("./models/sources/column_data_source");

DocumentChangedEvent = (function() {
  function DocumentChangedEvent(document) {
    this.document = document;
  }

  return DocumentChangedEvent;

})();

ModelChangedEvent = (function(superClass) {
  extend(ModelChangedEvent, superClass);

  function ModelChangedEvent(document, model1, attr1, old1, new_1) {
    this.document = document;
    this.model = model1;
    this.attr = attr1;
    this.old = old1;
    this.new_ = new_1;
    ModelChangedEvent.__super__.constructor.call(this, this.document);
  }

  ModelChangedEvent.prototype.json = function(references) {
    var id, value, value_json, value_refs;
    if (this.attr === 'id') {
      console.log("'id' field is immutable and should never be in a ModelChangedEvent ", this);
      throw new Error("'id' field should never change, whatever code just set it is wrong");
    }
    value = this.new_;
    value_json = HasProps._value_to_json('new_', value, this.model);
    value_refs = {};
    HasProps._value_record_references(value, value_refs, true);
    if (this.model.id in value_refs && this.model !== value) {
      delete value_refs[this.model.id];
    }
    for (id in value_refs) {
      references[id] = value_refs[id];
    }
    return {
      'kind': 'ModelChanged',
      'model': this.model.ref(),
      'attr': this.attr,
      'new': value_json
    };
  };

  return ModelChangedEvent;

})(DocumentChangedEvent);

TitleChangedEvent = (function(superClass) {
  extend(TitleChangedEvent, superClass);

  function TitleChangedEvent(document, title1) {
    this.document = document;
    this.title = title1;
    TitleChangedEvent.__super__.constructor.call(this, this.document);
  }

  TitleChangedEvent.prototype.json = function(references) {
    return {
      'kind': 'TitleChanged',
      'title': this.title
    };
  };

  return TitleChangedEvent;

})(DocumentChangedEvent);

RootAddedEvent = (function(superClass) {
  extend(RootAddedEvent, superClass);

  function RootAddedEvent(document, model1) {
    this.document = document;
    this.model = model1;
    RootAddedEvent.__super__.constructor.call(this, this.document);
  }

  RootAddedEvent.prototype.json = function(references) {
    HasProps._value_record_references(this.model, references, true);
    return {
      'kind': 'RootAdded',
      'model': this.model.ref()
    };
  };

  return RootAddedEvent;

})(DocumentChangedEvent);

RootRemovedEvent = (function(superClass) {
  extend(RootRemovedEvent, superClass);

  function RootRemovedEvent(document, model1) {
    this.document = document;
    this.model = model1;
    RootRemovedEvent.__super__.constructor.call(this, this.document);
  }

  RootRemovedEvent.prototype.json = function(references) {
    return {
      'kind': 'RootRemoved',
      'model': this.model.ref()
    };
  };

  return RootRemovedEvent;

})(DocumentChangedEvent);

DEFAULT_TITLE = "Bokeh Application";

Document = (function() {
  function Document() {
    this._title = DEFAULT_TITLE;
    this._roots = [];
    this._all_models = {};
    this._all_models_by_name = new MultiDict();
    this._all_models_freeze_count = 0;
    this._callbacks = [];
    this._doc_width = new Variable("document_width");
    this._doc_height = new Variable("document_height");
    this._solver = new Solver();
    this._init_solver();
    $(window).on("resize", (function(_this) {
      return function() {
        return _this.resize();
      };
    })(this));
  }

  Document.prototype._init_solver = function() {
    var j, len, model, ref3, results;
    this._solver.clear();
    this._solver.add_edit_variable(this._doc_width);
    this._solver.add_edit_variable(this._doc_height);
    ref3 = this._roots;
    results = [];
    for (j = 0, len = ref3.length; j < len; j++) {
      model = ref3[j];
      if (model.layoutable) {
        results.push(this._add_layoutable(model));
      } else {
        results.push(void 0);
      }
    }
    return results;
  };

  Document.prototype.solver = function() {
    return this._solver;
  };

  Document.prototype.resize = function(width, height) {
    if (width == null) {
      width = null;
    }
    if (height == null) {
      height = null;
    }
    this._resize(width, height);
    return this._resize(width, height);
  };

  Document.prototype._resize = function(width, height) {
    var j, len, measuring, ref3, root, root_div, target_height, vars;
    if (width == null) {
      width = null;
    }
    if (height == null) {
      height = null;
    }
    ref3 = this._roots;
    for (j = 0, len = ref3.length; j < len; j++) {
      root = ref3[j];
      if (root.layoutable !== true) {
        continue;
      }
      vars = root.get_constrained_variables();
      if ((vars.width == null) && (vars.height == null)) {
        continue;
      }
      root_div = $("#modelid_" + root.id);
      if (_.isNull(width)) {
        target_height = 0;
        measuring = root_div;
        while (target_height === 0) {
          measuring = measuring.parent();
          target_height = measuring.height();
        }
        width = measuring.width();
        height = target_height;
      }
      if (vars.width != null) {
        logger.debug("Suggest width on Document -- " + width);
        this._solver.suggest_value(this._doc_width, width);
      }
      if (vars.height != null) {
        logger.debug("Suggest height on Document -- " + height);
        this._solver.suggest_value(this._doc_height, height);
      }
    }
    this._solver.update_variables(false);
    return this._solver.trigger('resize');
  };

  Document.prototype.clear = function() {
    var results;
    this._push_all_models_freeze();
    try {
      results = [];
      while (this._roots.length > 0) {
        results.push(this.remove_root(this._roots[0]));
      }
      return results;
    } finally {
      this._pop_all_models_freeze();
    }
  };

  Document.prototype._destructively_move = function(dest_doc) {
    var j, l, len, len1, r, roots;
    if (dest_doc === this) {
      throw new Error("Attempted to overwrite a document with itself");
    }
    dest_doc.clear();
    roots = [];
    this._push_all_models_freeze();
    try {
      while (this._roots.length > 0) {
        this.remove_root(this._roots[0]);
        roots.push(r);
      }
    } finally {
      this._pop_all_models_freeze();
    }
    for (j = 0, len = roots.length; j < len; j++) {
      r = roots[j];
      if (r.document !== null) {
        throw new Error("Somehow we didn't detach " + r);
      }
    }
    if (_all_models.length !== 0) {
      throw new Error("_all_models still had stuff in it: " + this._all_models);
    }
    for (l = 0, len1 = roots.length; l < len1; l++) {
      r = roots[l];
      dest_doc.add_root(r);
    }
    return dest_doc.set_title(this._title);
  };

  Document.prototype._push_all_models_freeze = function() {
    return this._all_models_freeze_count += 1;
  };

  Document.prototype._pop_all_models_freeze = function() {
    this._all_models_freeze_count -= 1;
    if (this._all_models_freeze_count === 0) {
      return this._recompute_all_models();
    }
  };

  Document.prototype._invalidate_all_models = function() {
    logger.debug("invalidating document models");
    if (this._all_models_freeze_count === 0) {
      return this._recompute_all_models();
    }
  };

  Document.prototype._recompute_all_models = function() {
    var a, d, j, l, len, len1, len2, len3, m, n, name, new_all_models_set, o, old_all_models_set, r, recomputed, ref3, ref4, ref5, ref6, to_attach, to_detach;
    new_all_models_set = new Set();
    ref3 = this._roots;
    for (j = 0, len = ref3.length; j < len; j++) {
      r = ref3[j];
      new_all_models_set = new_all_models_set.union(r.references());
    }
    old_all_models_set = new Set(_.values(this._all_models));
    to_detach = old_all_models_set.diff(new_all_models_set);
    to_attach = new_all_models_set.diff(old_all_models_set);
    recomputed = {};
    ref4 = new_all_models_set.values;
    for (l = 0, len1 = ref4.length; l < len1; l++) {
      m = ref4[l];
      recomputed[m.id] = m;
    }
    ref5 = to_detach.values;
    for (n = 0, len2 = ref5.length; n < len2; n++) {
      d = ref5[n];
      d.detach_document();
      name = d.name;
      if (name !== null) {
        this._all_models_by_name.remove_value(name, d);
      }
    }
    ref6 = to_attach.values;
    for (o = 0, len3 = ref6.length; o < len3; o++) {
      a = ref6[o];
      a.attach_document(this);
      name = a.name;
      if (name !== null) {
        this._all_models_by_name.add_value(name, a);
      }
    }
    return this._all_models = recomputed;
  };

  Document.prototype.roots = function() {
    return this._roots;
  };

  Document.prototype._add_layoutable = function(model) {
    var constraint, constraints, edit_variable, editables, j, l, len, len1, ref3, strength, vars;
    if (model.layoutable !== true) {
      throw new Error("Cannot add non-layoutable - " + model);
    }
    editables = model.get_edit_variables();
    constraints = model.get_constraints();
    vars = model.get_constrained_variables();
    for (j = 0, len = editables.length; j < len; j++) {
      ref3 = editables[j], edit_variable = ref3.edit_variable, strength = ref3.strength;
      this._solver.add_edit_variable(edit_variable, strength);
    }
    for (l = 0, len1 = constraints.length; l < len1; l++) {
      constraint = constraints[l];
      this._solver.add_constraint(constraint);
    }
    if (vars.width != null) {
      this._solver.add_constraint(EQ(vars.width, this._doc_width));
    }
    if (vars.height != null) {
      this._solver.add_constraint(EQ(vars.height, this._doc_height));
    }
    return this._solver.update_variables();
  };

  Document.prototype.add_root = function(model) {
    logger.debug("Adding root: " + model);
    if (indexOf.call(this._roots, model) >= 0) {
      return;
    }
    this._push_all_models_freeze();
    try {
      this._roots.push(model);
      model._is_root = true;
    } finally {
      this._pop_all_models_freeze();
    }
    this._init_solver();
    return this._trigger_on_change(new RootAddedEvent(this, model));
  };

  Document.prototype.remove_root = function(model) {
    var i;
    i = this._roots.indexOf(model);
    if (i < 0) {
      return;
    }
    this._push_all_models_freeze();
    try {
      this._roots.splice(i, 1);
      model._is_root = false;
    } finally {
      this._pop_all_models_freeze();
    }
    this._init_solver();
    return this._trigger_on_change(new RootRemovedEvent(this, model));
  };

  Document.prototype.title = function() {
    return this._title;
  };

  Document.prototype.set_title = function(title) {
    if (title !== this._title) {
      this._title = title;
      return this._trigger_on_change(new TitleChangedEvent(this, title));
    }
  };

  Document.prototype.get_model_by_id = function(model_id) {
    if (model_id in this._all_models) {
      return this._all_models[model_id];
    } else {
      return null;
    }
  };

  Document.prototype.get_model_by_name = function(name) {
    return this._all_models_by_name.get_one(name, "Multiple models are named '" + name + "'");
  };

  Document.prototype.on_change = function(callback) {
    if (indexOf.call(this._callbacks, callback) >= 0) {
      return;
    }
    return this._callbacks.push(callback);
  };

  Document.prototype.remove_on_change = function(callback) {
    var i;
    i = this._callbacks.indexOf(callback);
    if (i >= 0) {
      return this._callbacks.splice(i, 1);
    }
  };

  Document.prototype._trigger_on_change = function(event) {
    var cb, j, len, ref3, results;
    ref3 = this._callbacks;
    results = [];
    for (j = 0, len = ref3.length; j < len; j++) {
      cb = ref3[j];
      results.push(cb(event));
    }
    return results;
  };

  Document.prototype._notify_change = function(model, attr, old, new_) {
    if (attr === 'name') {
      this._all_models_by_name.remove_value(old, model);
      if (new_ !== null) {
        this._all_models_by_name.add_value(new_, model);
      }
    }
    return this._trigger_on_change(new ModelChangedEvent(this, model, attr, old, new_));
  };

  Document._references_json = function(references, include_defaults) {
    var j, len, r, ref, references_json;
    if (include_defaults == null) {
      include_defaults = true;
    }
    references_json = [];
    for (j = 0, len = references.length; j < len; j++) {
      r = references[j];
      ref = r.ref();
      ref['attributes'] = r.attributes_as_json(include_defaults);
      delete ref['attributes']['id'];
      references_json.push(ref);
    }
    return references_json;
  };

  Document._instantiate_object = function(obj_id, obj_type, obj_attrs) {
    var full_attrs, model;
    full_attrs = _.extend({}, obj_attrs, {
      id: obj_id
    });
    model = Models(obj_type);
    return new model(full_attrs, {
      silent: true,
      defer_initialization: true
    });
  };

  Document._instantiate_references_json = function(references_json, existing_models) {
    var instance, j, len, obj, obj_attrs, obj_id, obj_type, references;
    references = {};
    for (j = 0, len = references_json.length; j < len; j++) {
      obj = references_json[j];
      obj_id = obj['id'];
      obj_type = obj['type'];
      obj_attrs = obj['attributes'];
      if (obj_id in existing_models) {
        instance = existing_models[obj_id];
      } else {
        instance = Document._instantiate_object(obj_id, obj_type, obj_attrs);
        if ('subtype' in obj) {
          instance.set_subtype(obj['subtype']);
        }
      }
      references[instance.id] = instance;
    }
    return references;
  };

  Document._resolve_refs = function(value, old_references, new_references) {
    var resolve_array, resolve_dict, resolve_ref;
    resolve_ref = function(v) {
      if (is_ref(v)) {
        if (v['id'] in old_references) {
          return old_references[v['id']];
        } else if (v['id'] in new_references) {
          return new_references[v['id']];
        } else {
          throw new Error("reference " + (JSON.stringify(v)) + " isn't known (not in Document?)");
        }
      } else if (_.isArray(v)) {
        return resolve_array(v);
      } else if (_.isObject(v)) {
        return resolve_dict(v);
      } else {
        return v;
      }
    };
    resolve_dict = function(dict) {
      var k, resolved, v;
      resolved = {};
      for (k in dict) {
        v = dict[k];
        resolved[k] = resolve_ref(v);
      }
      return resolved;
    };
    resolve_array = function(array) {
      var j, len, results, v;
      results = [];
      for (j = 0, len = array.length; j < len; j++) {
        v = array[j];
        results.push(resolve_ref(v));
      }
      return results;
    };
    return resolve_ref(value);
  };

  Document._initialize_references_json = function(references_json, old_references, new_references) {
    var foreach_depth_first, instance, j, len, obj, obj_attrs, obj_id, to_update, was_new;
    to_update = {};
    for (j = 0, len = references_json.length; j < len; j++) {
      obj = references_json[j];
      obj_id = obj['id'];
      obj_attrs = obj['attributes'];
      was_new = false;
      instance = obj_id in old_references ? old_references[obj_id] : (was_new = true, new_references[obj_id]);
      obj_attrs = Document._resolve_refs(obj_attrs, old_references, new_references);
      to_update[instance.id] = [instance, obj_attrs, was_new];
    }
    foreach_depth_first = function(items, f) {
      var already_started, foreach_value, k, results, v;
      already_started = {};
      foreach_value = function(v, f) {
        var a, attrs, e, k, l, len1, ref3, results, results1, same_as_v;
        if (v instanceof HasProps) {
          if (!(v.id in already_started) && v.id in items) {
            already_started[v.id] = true;
            ref3 = items[v.id], same_as_v = ref3[0], attrs = ref3[1], was_new = ref3[2];
            for (a in attrs) {
              e = attrs[a];
              foreach_value(e, f);
            }
            return f(v, attrs, was_new);
          }
        } else if (_.isArray(v)) {
          results = [];
          for (l = 0, len1 = v.length; l < len1; l++) {
            e = v[l];
            results.push(foreach_value(e, f));
          }
          return results;
        } else if (_.isObject(v)) {
          results1 = [];
          for (k in v) {
            e = v[k];
            results1.push(foreach_value(e, f));
          }
          return results1;
        }
      };
      results = [];
      for (k in items) {
        v = items[k];
        results.push(foreach_value(v[0], f));
      }
      return results;
    };
    foreach_depth_first(to_update, function(instance, attrs, was_new) {
      if (was_new) {
        return instance.setv(attrs);
      }
    });
    return foreach_depth_first(to_update, function(instance, attrs, was_new) {
      if (was_new) {
        return instance.initialize(attrs);
      }
    });
  };

  Document._event_for_attribute_change = function(changed_obj, key, new_value, doc, value_refs) {
    var changed_model, event;
    changed_model = doc.get_model_by_id(changed_obj.id);
    if (!changed_model.attribute_is_serializable(key)) {
      return null;
    }
    event = {
      'kind': 'ModelChanged',
      'model': {
        id: changed_obj.id,
        type: changed_obj.type
      },
      'attr': key,
      'new': new_value
    };
    HasProps._json_record_references(doc, new_value, value_refs, true);
    return event;
  };

  Document._events_to_sync_objects = function(from_obj, to_obj, to_doc, value_refs) {
    var added, events, from_keys, j, key, l, len, len1, len2, n, new_value, old_value, removed, shared, to_keys;
    from_keys = Object.keys(from_obj.attributes);
    to_keys = Object.keys(to_obj.attributes);
    removed = _.difference(from_keys, to_keys);
    added = _.difference(to_keys, from_keys);
    shared = _.intersection(from_keys, to_keys);
    events = [];
    for (j = 0, len = removed.length; j < len; j++) {
      key = removed[j];
      logger.warn("Server sent key " + key + " but we don't seem to have it in our JSON");
    }
    for (l = 0, len1 = added.length; l < len1; l++) {
      key = added[l];
      new_value = to_obj.attributes[key];
      events.push(Document._event_for_attribute_change(from_obj, key, new_value, to_doc, value_refs));
    }
    for (n = 0, len2 = shared.length; n < len2; n++) {
      key = shared[n];
      old_value = from_obj.attributes[key];
      new_value = to_obj.attributes[key];
      if (old_value === null && new_value === null) {

      } else if (old_value === null || new_value === null) {
        events.push(Document._event_for_attribute_change(from_obj, key, new_value, to_doc, value_refs));
      } else {
        if (!_.isEqual(old_value, new_value)) {
          events.push(Document._event_for_attribute_change(from_obj, key, new_value, to_doc, value_refs));
        }
      }
    }
    return _.filter(events, function(e) {
      return e !== null;
    });
  };

  Document._compute_patch_since_json = function(from_json, to_doc) {
    var events, from_references, from_root_ids, from_roots, id, include_defaults, j, l, len, len1, model, r, ref3, ref4, ref5, refs, to_json, to_references, to_root_ids, to_roots, update_model_events, value_refs;
    to_json = to_doc.to_json(include_defaults = false);
    refs = function(json) {
      var j, len, obj, ref3, result;
      result = {};
      ref3 = json['roots']['references'];
      for (j = 0, len = ref3.length; j < len; j++) {
        obj = ref3[j];
        result[obj.id] = obj;
      }
      return result;
    };
    from_references = refs(from_json);
    from_roots = {};
    from_root_ids = [];
    ref3 = from_json['roots']['root_ids'];
    for (j = 0, len = ref3.length; j < len; j++) {
      r = ref3[j];
      from_roots[r] = from_references[r];
      from_root_ids.push(r);
    }
    to_references = refs(to_json);
    to_roots = {};
    to_root_ids = [];
    ref4 = to_json['roots']['root_ids'];
    for (l = 0, len1 = ref4.length; l < len1; l++) {
      r = ref4[l];
      to_roots[r] = to_references[r];
      to_root_ids.push(r);
    }
    from_root_ids.sort();
    to_root_ids.sort();
    if (_.difference(from_root_ids, to_root_ids).length > 0 || _.difference(to_root_ids, from_root_ids).length > 0) {
      throw new Error("Not implemented: computing add/remove of document roots");
    }
    value_refs = {};
    events = [];
    ref5 = to_doc._all_models;
    for (id in ref5) {
      model = ref5[id];
      if (id in from_references) {
        update_model_events = Document._events_to_sync_objects(from_references[id], to_references[id], to_doc, value_refs);
        events = events.concat(update_model_events);
      }
    }
    return {
      'events': events,
      'references': Document._references_json(_.values(value_refs), include_defaults = false)
    };
  };

  Document.prototype.to_json_string = function(include_defaults) {
    if (include_defaults == null) {
      include_defaults = true;
    }
    return JSON.stringify(this.to_json(include_defaults));
  };

  Document.prototype.to_json = function(include_defaults) {
    var j, len, r, ref3, root_ids, root_references;
    if (include_defaults == null) {
      include_defaults = true;
    }
    root_ids = [];
    ref3 = this._roots;
    for (j = 0, len = ref3.length; j < len; j++) {
      r = ref3[j];
      root_ids.push(r.id);
    }
    root_references = _.values(this._all_models);
    return {
      'title': this._title,
      'roots': {
        'root_ids': root_ids,
        'references': Document._references_json(root_references, include_defaults)
      }
    };
  };

  Document.from_json_string = function(s) {
    var json;
    if (s === null || (s == null)) {
      throw new Error("JSON string is " + (typeof s));
    }
    json = JSON.parse(s);
    return Document.from_json(json);
  };

  Document.from_json = function(json) {
    var doc, j, len, py_version, r, references, references_json, root_ids, roots_json, versions_string;
    logger.debug("Creating Document from JSON");
    if (typeof json !== 'object') {
      throw new Error("JSON object has wrong type " + (typeof json));
    }
    py_version = json['version'];
    versions_string = "Library versions: JS (" + js_version + ")  /  Python (" + py_version + ")";
    if (py_version.indexOf('-') < 0 && js_version !== py_version) {
      logger.warn("JS/Python version mismatch");
      logger.warn(versions_string);
    } else {
      logger.debug(versions_string);
    }
    roots_json = json['roots'];
    root_ids = roots_json['root_ids'];
    references_json = roots_json['references'];
    references = Document._instantiate_references_json(references_json, {});
    Document._initialize_references_json(references_json, {}, references);
    doc = new Document();
    for (j = 0, len = root_ids.length; j < len; j++) {
      r = root_ids[j];
      doc.add_root(references[r]);
    }
    doc.set_title(json['title']);
    return doc;
  };

  Document.prototype.replace_with_json = function(json) {
    var replacement;
    replacement = Document.from_json(json);
    return replacement._destructively_move(this);
  };

  Document.prototype.create_json_patch_string = function(events) {
    return JSON.stringify(this.create_json_patch(events));
  };

  Document.prototype.create_json_patch = function(events) {
    var event, j, json_events, len, references, result;
    references = {};
    json_events = [];
    for (j = 0, len = events.length; j < len; j++) {
      event = events[j];
      if (event.document !== this) {
        console.log("Cannot create a patch using events from a different document, event had ", event.document, " we are ", this);
        throw new Error("Cannot create a patch using events from a different document");
      }
      json_events.push(event.json(references));
    }
    return result = {
      events: json_events,
      references: Document._references_json(_.values(references))
    };
  };

  Document.prototype.apply_json_patch_string = function(patch) {
    return this.apply_json_patch(JSON.parse(patch));
  };

  Document.prototype.apply_json_patch = function(patch) {
    var attr, column_source, column_source_id, data, event_json, events_json, id, j, l, len, len1, model_id, new_references, obj1, old_references, patched_id, patched_obj, patches, references, references_json, results, rollover, root_id, root_obj, value;
    references_json = patch['references'];
    events_json = patch['events'];
    references = Document._instantiate_references_json(references_json, this._all_models);
    for (j = 0, len = events_json.length; j < len; j++) {
      event_json = events_json[j];
      if ('model' in event_json) {
        model_id = event_json['model']['id'];
        if (model_id in this._all_models) {
          references[model_id] = this._all_models[model_id];
        } else {
          if (!(model_id in references)) {
            console.log("Got an event for unknown model ", event_json['model']);
            throw new Error("event model wasn't known");
          }
        }
      }
    }
    old_references = {};
    new_references = {};
    for (id in references) {
      value = references[id];
      if (id in this._all_models) {
        old_references[id] = value;
      } else {
        new_references[id] = value;
      }
    }
    Document._initialize_references_json(references_json, old_references, new_references);
    results = [];
    for (l = 0, len1 = events_json.length; l < len1; l++) {
      event_json = events_json[l];
      switch (event_json.kind) {
        case 'ModelChanged':
          patched_id = event_json['model']['id'];
          if (!(patched_id in this._all_models)) {
            throw new Error("Cannot apply patch to " + patched_id + " which is not in the document");
          }
          patched_obj = this._all_models[patched_id];
          attr = event_json['attr'];
          value = Document._resolve_refs(event_json['new'], old_references, new_references);
          results.push(patched_obj.setv((
            obj1 = {},
            obj1["" + attr] = value,
            obj1
          )));
          break;
        case 'ColumnsStreamed':
          column_source_id = event_json['column_source']['id'];
          if (!(column_source_id in this._all_models)) {
            throw new Error("Cannot stream to " + column_source_id + " which is not in the document");
          }
          column_source = this._all_models[column_source_id];
          if (!(column_source instanceof ColumnDataSource.Model)) {
            throw new Error("Cannot stream to non-ColumnDataSource");
          }
          data = event_json['data'];
          rollover = event_json['rollover'];
          results.push(column_source.stream(data, rollover));
          break;
        case 'ColumnsPatched':
          column_source_id = event_json['column_source']['id'];
          if (!(column_source_id in this._all_models)) {
            throw new Error("Cannot patch " + column_source_id + " which is not in the document");
          }
          column_source = this._all_models[column_source_id];
          if (!(column_source instanceof ColumnDataSource.Model)) {
            throw new Error("Cannot patch non-ColumnDataSource");
          }
          patches = event_json['patches'];
          results.push(column_source.patch(patches));
          break;
        case 'RootAdded':
          root_id = event_json['model']['id'];
          root_obj = references[root_id];
          results.push(this.add_root(root_obj));
          break;
        case 'RootRemoved':
          root_id = event_json['model']['id'];
          root_obj = references[root_id];
          results.push(this.remove_root(root_obj));
          break;
        case 'TitleChanged':
          results.push(this.set_title(event_json['title']));
          break;
        default:
          throw new Error("Unknown patch event " + JSON.stringify(event_json));
      }
    }
    return results;
  };

  return Document;

})();

module.exports = {
  Document: Document,
  DocumentChangedEvent: DocumentChangedEvent,
  ModelChangedEvent: ModelChangedEvent,
  TitleChangedEvent: TitleChangedEvent,
  RootAddedEvent: RootAddedEvent,
  RootRemovedEvent: RootRemovedEvent,
  DEFAULT_TITLE: DEFAULT_TITLE
};
