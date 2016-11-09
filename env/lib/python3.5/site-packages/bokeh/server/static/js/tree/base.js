var Models, _, _get_mod_cache, _mod_cache, index, locations, logger, make_cache, overrides,
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

logger = require("./core/logging").logger;

require("./core/util/underscore").patch();

locations = require("./models/index");

overrides = {};

make_cache = function(locations) {
  var mod, modname, name, ref, result, spec, subname, subspec, suffix;
  result = {};
  for (name in locations) {
    spec = locations[name];
    if (_.isArray(spec)) {
      subspec = spec[0];
      suffix = (ref = spec[1]) != null ? ref : "";
      for (subname in subspec) {
        mod = subspec[subname];
        modname = subname + suffix;
        result[modname] = mod;
      }
    } else {
      result[name] = spec;
    }
  }
  return result;
};

_mod_cache = null;

_get_mod_cache = function() {
  if (_mod_cache == null) {
    _mod_cache = make_cache(locations);
  }
  return _mod_cache;
};

Models = function(typename) {
  var mod, mod_cache;
  mod_cache = _get_mod_cache();
  if (overrides[typename]) {
    return overrides[typename];
  }
  mod = mod_cache[typename];
  if (mod == null) {
    throw new Error("Module `" + typename + "' does not exists. The problem may be two fold. Either a model was requested that's available in an extra bundle, e.g. a widget, or a custom model was requested, but it wasn't registered before first usage.");
  }
  return mod.Model;
};

Models.register = function(name, model) {
  return overrides[name] = model;
};

Models.unregister = function(name) {
  return delete overrides[name];
};

Models.register_locations = function(locations, force, errorFn) {
  var cache, mod_cache, module, name, results;
  if (force == null) {
    force = false;
  }
  if (errorFn == null) {
    errorFn = null;
  }
  mod_cache = _get_mod_cache();
  cache = make_cache(locations);
  results = [];
  for (name in cache) {
    if (!hasProp.call(cache, name)) continue;
    module = cache[name];
    if (force || !mod_cache.hasOwnProperty(name)) {
      results.push(mod_cache[name] = module);
    } else {
      results.push(typeof errorFn === "function" ? errorFn(name) : void 0);
    }
  }
  return results;
};

Models.registered_names = function() {
  return Object.keys(_get_mod_cache());
};

index = {};

module.exports = {
  overrides: overrides,
  index: index,
  Models: Models
};
