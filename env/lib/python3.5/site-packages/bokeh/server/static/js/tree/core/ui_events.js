var $, Events, Hammer, UIEvents, _, logger, mousewheel;

_ = require("underscore");

$ = require("jquery");

Hammer = require("hammerjs");

mousewheel = require("jquery-mousewheel")($);

Events = require("./events").Events;

logger = require("./logging").logger;

UIEvents = (function() {
  _.extend(UIEvents.prototype, Events);

  function UIEvents(toolbar, hit_area) {
    this.toolbar = toolbar;
    this.hit_area = hit_area;
    this._configure_hammerjs();
  }

  UIEvents.prototype._configure_hammerjs = function() {
    this.hammer = new Hammer(this.hit_area[0]);
    this.hammer.get('doubletap').recognizeWith('tap');
    this.hammer.get('tap').requireFailure('doubletap');
    this.hammer.get('doubletap').dropRequireFailure('tap');
    this.hammer.on('doubletap', (function(_this) {
      return function(e) {
        return _this._doubletap(e);
      };
    })(this));
    this.hammer.on('tap', (function(_this) {
      return function(e) {
        return _this._tap(e);
      };
    })(this));
    this.hammer.on('press', (function(_this) {
      return function(e) {
        return _this._press(e);
      };
    })(this));
    this.hammer.get('pan').set({
      direction: Hammer.DIRECTION_ALL
    });
    this.hammer.on('panstart', (function(_this) {
      return function(e) {
        return _this._pan_start(e);
      };
    })(this));
    this.hammer.on('pan', (function(_this) {
      return function(e) {
        return _this._pan(e);
      };
    })(this));
    this.hammer.on('panend', (function(_this) {
      return function(e) {
        return _this._pan_end(e);
      };
    })(this));
    this.hammer.get('pinch').set({
      enable: true
    });
    this.hammer.on('pinchstart', (function(_this) {
      return function(e) {
        return _this._pinch_start(e);
      };
    })(this));
    this.hammer.on('pinch', (function(_this) {
      return function(e) {
        return _this._pinch(e);
      };
    })(this));
    this.hammer.on('pinchend', (function(_this) {
      return function(e) {
        return _this._pinch_end(e);
      };
    })(this));
    this.hammer.get('rotate').set({
      enable: true
    });
    this.hammer.on('rotatestart', (function(_this) {
      return function(e) {
        return _this._rotate_start(e);
      };
    })(this));
    this.hammer.on('rotate', (function(_this) {
      return function(e) {
        return _this._rotate(e);
      };
    })(this));
    this.hammer.on('rotateend', (function(_this) {
      return function(e) {
        return _this._rotate_end(e);
      };
    })(this));
    this.hit_area.mousemove((function(_this) {
      return function(e) {
        return _this._mouse_move(e);
      };
    })(this));
    this.hit_area.mouseenter((function(_this) {
      return function(e) {
        return _this._mouse_enter(e);
      };
    })(this));
    this.hit_area.mouseleave((function(_this) {
      return function(e) {
        return _this._mouse_exit(e);
      };
    })(this));
    this.hit_area.mousewheel((function(_this) {
      return function(e, delta) {
        return _this._mouse_wheel(e, delta);
      };
    })(this));
    $(document).keydown((function(_this) {
      return function(e) {
        return _this._key_down(e);
      };
    })(this));
    return $(document).keyup((function(_this) {
      return function(e) {
        return _this._key_up(e);
      };
    })(this));
  };

  UIEvents.prototype.register_tool = function(tool_view) {
    var et, id, type;
    et = tool_view.model.event_type;
    id = tool_view.model.id;
    type = tool_view.model.type;
    if (et == null) {
      logger.debug("Button tool: " + type);
      return;
    }
    if (et === 'pan' || et === 'pinch' || et === 'rotate') {
      logger.debug("Registering tool: " + type + " for event '" + et + "'");
      if (tool_view["_" + et + "_start"] != null) {
        tool_view.listenTo(this, et + ":start:" + id, tool_view["_" + et + "_start"]);
      }
      if (tool_view["_" + et]) {
        tool_view.listenTo(this, et + ":" + id, tool_view["_" + et]);
      }
      if (tool_view["_" + et + "_end"]) {
        tool_view.listenTo(this, et + ":end:" + id, tool_view["_" + et + "_end"]);
      }
    } else if (et === "move") {
      logger.debug("Registering tool: " + type + " for event '" + et + "'");
      if (tool_view._move_enter != null) {
        tool_view.listenTo(this, "move:enter", tool_view._move_enter);
      }
      tool_view.listenTo(this, "move", tool_view["_move"]);
      if (tool_view._move_exit != null) {
        tool_view.listenTo(this, "move:exit", tool_view._move_exit);
      }
    } else {
      logger.debug("Registering tool: " + type + " for event '" + et + "'");
      tool_view.listenTo(this, et + ":" + id, tool_view["_" + et]);
    }
    if (tool_view._keydown != null) {
      logger.debug("Registering tool: " + type + " for event 'keydown'");
      tool_view.listenTo(this, "keydown", tool_view._keydown);
    }
    if (tool_view._keyup != null) {
      logger.debug("Registering tool: " + type + " for event 'keyup'");
      tool_view.listenTo(this, "keyup", tool_view._keyup);
    }
    if (tool_view._doubletap != null) {
      logger.debug("Registering tool: " + type + " for event 'doubletap'");
      tool_view.listenTo(this, "doubletap", tool_view._doubletap);
    }
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      if (et === 'pinch') {
        logger.debug("Registering scroll on touch screen");
        return tool_view.listenTo(this, "scroll:" + id, tool_view["_scroll"]);
      }
    }
  };

  UIEvents.prototype._trigger = function(event_type, e) {
    var active_tool, base_event_type, gestures;
    base_event_type = event_type.split(":")[0];
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      if (event_type === 'scroll') {
        base_event_type = 'pinch';
      }
    }
    gestures = this.toolbar.gestures;
    active_tool = gestures[base_event_type].active;
    if (active_tool != null) {
      return this._trigger_event(event_type, active_tool, e);
    }
  };

  UIEvents.prototype._trigger_event = function(event_type, active_tool, e) {
    if (active_tool.active === true) {
      if (event_type === 'scroll') {
        e.preventDefault();
        e.stopPropagation();
      }
      return this.trigger(event_type + ":" + active_tool.id, e);
    }
  };

  UIEvents.prototype._bokify_hammer = function(e) {
    var left, offset, ref, ref1, top, x, y;
    if (e.pointerType === 'mouse') {
      x = e.srcEvent.pageX;
      y = e.srcEvent.pageY;
    } else {
      x = e.pointers[0].pageX;
      y = e.pointers[0].pageY;
    }
    offset = $(e.target).offset();
    left = (ref = offset.left) != null ? ref : 0;
    top = (ref1 = offset.top) != null ? ref1 : 0;
    return e.bokeh = {
      sx: x - left,
      sy: y - top
    };
  };

  UIEvents.prototype._bokify_jq = function(e) {
    var left, offset, ref, ref1, top;
    offset = $(e.currentTarget).offset();
    left = (ref = offset.left) != null ? ref : 0;
    top = (ref1 = offset.top) != null ? ref1 : 0;
    return e.bokeh = {
      sx: e.pageX - left,
      sy: e.pageY - top
    };
  };

  UIEvents.prototype._tap = function(e) {
    this._bokify_hammer(e);
    return this._trigger('tap', e);
  };

  UIEvents.prototype._doubletap = function(e) {
    this._bokify_hammer(e);
    return this.trigger('doubletap', e);
  };

  UIEvents.prototype._press = function(e) {
    this._bokify_hammer(e);
    return this._trigger('press', e);
  };

  UIEvents.prototype._pan_start = function(e) {
    this._bokify_hammer(e);
    e.bokeh.sx -= e.deltaX;
    e.bokeh.sy -= e.deltaY;
    return this._trigger('pan:start', e);
  };

  UIEvents.prototype._pan = function(e) {
    this._bokify_hammer(e);
    return this._trigger('pan', e);
  };

  UIEvents.prototype._pan_end = function(e) {
    this._bokify_hammer(e);
    return this._trigger('pan:end', e);
  };

  UIEvents.prototype._pinch_start = function(e) {
    this._bokify_hammer(e);
    return this._trigger('pinch:start', e);
  };

  UIEvents.prototype._pinch = function(e) {
    this._bokify_hammer(e);
    return this._trigger('pinch', e);
  };

  UIEvents.prototype._pinch_end = function(e) {
    this._bokify_hammer(e);
    return this._trigger('pinch:end', e);
  };

  UIEvents.prototype._rotate_start = function(e) {
    this._bokify_hammer(e);
    return this._trigger('rotate:start', e);
  };

  UIEvents.prototype._rotate = function(e) {
    this._bokify_hammer(e);
    return this._trigger('rotate', e);
  };

  UIEvents.prototype._rotate_end = function(e) {
    this._bokify_hammer(e);
    return this._trigger('rotate:end', e);
  };

  UIEvents.prototype._mouse_enter = function(e) {
    this._bokify_jq(e);
    return this.trigger('move:enter', e);
  };

  UIEvents.prototype._mouse_move = function(e) {
    this._bokify_jq(e);
    return this.trigger('move', e);
  };

  UIEvents.prototype._mouse_exit = function(e) {
    this._bokify_jq(e);
    return this.trigger('move:exit', e);
  };

  UIEvents.prototype._mouse_wheel = function(e, delta) {
    this._bokify_jq(e);
    e.bokeh.delta = delta;
    return this._trigger('scroll', e);
  };

  UIEvents.prototype._key_down = function(e) {
    return this.trigger('keydown', e);
  };

  UIEvents.prototype._key_up = function(e) {
    return this.trigger('keyup', e);
  };

  return UIEvents;

})();

module.exports = {
  UIEvents: UIEvents
};
