var Bokeh, _, logging;

_ = require("underscore");

Bokeh = {};

Bokeh.require = require;

Bokeh.version = require("./version");

Bokeh._ = require("underscore");

Bokeh.$ = require("jquery");

logging = require("./core/logging");

Bokeh.logger = logging.logger;

Bokeh.set_log_level = logging.set_log_level;

Bokeh.index = require("./base").index;

Bokeh.embed = require("./embed");

Bokeh.safely = require("./safely");

Bokeh.Models = require("./base").Models;

module.exports = Bokeh;
