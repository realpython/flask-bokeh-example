var assert, bokehjs, path, pkg, root, rootRequire;

path = require("path");

assert = require("assert");

rootRequire = require("root-require");

root = rootRequire.packpath.parent();

pkg = rootRequire("./package.json");

module.constructor.prototype.require = function(modulePath) {
  var overridePath;
  assert(modulePath, 'missing path');
  assert(typeof modulePath === 'string', 'path must be a string');
  overridePath = pkg.browser[modulePath];
  if (overridePath != null) {
    modulePath = path.join(root, overridePath);
  }
  return this.constructor._load(modulePath, this);
};

bokehjs = function() {
  var Bokeh, _, load_plugin;
  if ((typeof window !== "undefined" && window !== null ? window.document : void 0) == null) {
    throw new Error("bokehjs requires a window with a document. If your runtime environment doesn't provide those, e.g. pure node.js, you can use jsdom library to configure window and document.");
  }
  Bokeh = require('./main');
  _ = Bokeh._;
  load_plugin = function(path) {
    var plugin, ref;
    plugin = require(path);
    _.extend(Bokeh, _.omit(plugin, "models"));
    return Bokeh.Models.register_locations((ref = plugin.models) != null ? ref : {});
  };
  load_plugin('./api');
  load_plugin('./models/widgets/main');
  return Bokeh;
};

module.exports = (typeof window !== "undefined" && window !== null ? window.document : void 0) != null ? bokehjs() : bokehjs;
