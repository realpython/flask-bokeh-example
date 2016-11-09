var LogLevel, Logger, _, _loggers, _method_factory, logger, noop, set_log_level,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

_ = require('underscore');

noop = function() {};

_method_factory = function(method_name, logger_name) {
  if (console[method_name] != null) {
    return console[method_name].bind(console, logger_name);
  } else if (console.log != null) {
    return console.log.bind(console, logger_name);
  } else {
    return noop;
  }
};

_loggers = {};

LogLevel = (function() {
  function LogLevel(name, level) {
    this.name = name;
    this.level = level;
  }

  return LogLevel;

})();

Logger = (function() {
  Logger.TRACE = new LogLevel("trace", 0);

  Logger.DEBUG = new LogLevel("debug", 1);

  Logger.INFO = new LogLevel("info", 2);

  Logger.WARN = new LogLevel("warn", 6);

  Logger.ERROR = new LogLevel("error", 7);

  Logger.FATAL = new LogLevel("fatal", 8);

  Logger.OFF = new LogLevel("off", 9);

  Logger.log_levels = {
    trace: Logger.TRACE,
    debug: Logger.DEBUG,
    info: Logger.INFO,
    warn: Logger.WARN,
    error: Logger.ERROR,
    fatal: Logger.FATAL,
    off: Logger.OFF
  };

  Object.defineProperty(Logger, 'levels', {
    get: function() {
      return Object.keys(Logger.log_levels);
    }
  });

  Logger.get = function(name, level) {
    var logger;
    if (level == null) {
      level = Logger.INFO;
    }
    if (_.isString(name) && name.length > 0) {
      logger = _loggers[name];
      if (logger == null) {
        logger = _loggers[name] = new Logger(name, level);
      }
      return logger;
    } else {
      throw new TypeError("Logger.get() expects a string name and an optional log-level");
    }
  };

  function Logger(name, level) {
    if (level == null) {
      level = Logger.INFO;
    }
    this._name = name;
    this.set_level(level);
  }

  Object.defineProperty(Logger.prototype, 'level', {
    get: function() {
      return this.get_level();
    }
  });

  Logger.prototype.get_level = function() {
    return this._log_level;
  };

  Logger.prototype.set_level = function(log_level) {
    var __, logger_name, method_name, ref, results;
    if (log_level instanceof LogLevel) {
      this._log_level = log_level;
    } else if (_.isString(log_level) && (Logger.log_levels[log_level] != null)) {
      this._log_level = Logger.log_levels[log_level];
    } else {
      throw new Error("Logger.set_level() expects a log-level object or a string name of a log-level");
    }
    logger_name = "[" + this._name + "]";
    ref = Logger.log_levels;
    results = [];
    for (__ in ref) {
      log_level = ref[__];
      if (log_level === Logger.OFF) {
        break;
      } else {
        method_name = log_level.name;
        if (log_level.level < this._log_level.level) {
          results.push(this[method_name] = noop);
        } else {
          results.push(this[method_name] = _method_factory(method_name, logger_name));
        }
      }
    }
    return results;
  };

  return Logger;

})();

logger = Logger.get("bokeh");

set_log_level = function(level) {
  if (indexOf.call(Logger.levels, level) < 0) {
    console.log("[bokeh] unrecognized logging level '" + level + "' passed to Bokeh.set_log_level(), ignoring");
    return console.log("[bokeh] valid log levels are: " + (Logger.levels.join(', ')));
  } else {
    console.log("[bokeh] setting log level to: '" + level + "'");
    return logger.set_level(level);
  }
};

module.exports = {
  Logger: Logger,
  logger: logger,
  set_log_level: set_log_level
};
