var Model, ToolProxy, p,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

p = require("../../core/properties");

Model = require("../../model");

ToolProxy = (function(superClass) {
  extend(ToolProxy, superClass);

  function ToolProxy() {
    return ToolProxy.__super__.constructor.apply(this, arguments);
  }

  ToolProxy.prototype.initialize = function(options) {
    ToolProxy.__super__.initialize.call(this, options);
    this.listenTo(this, 'do', this["do"]);
    return this.listenTo(this, 'change:active', this.set_active);
  };

  ToolProxy.prototype["do"] = function() {
    var i, len, ref, tool;
    ref = this.tools;
    for (i = 0, len = ref.length; i < len; i++) {
      tool = ref[i];
      tool.trigger('do');
    }
    return null;
  };

  ToolProxy.prototype.set_active = function() {
    var i, len, ref, tool;
    ref = this.tools;
    for (i = 0, len = ref.length; i < len; i++) {
      tool = ref[i];
      tool.active = this.active;
    }
    return null;
  };

  ToolProxy.define({
    tools: [p.Array, []],
    active: [p.Bool, false],
    tooltip: [p.String],
    tool_name: [p.String],
    disabled: [p.Bool, false],
    event_type: [p.String],
    icon: [p.String]
  });

  ToolProxy.prototype._clicked = function() {
    var active;
    active = this.model.active;
    return this.model.active = !active;
  };

  return ToolProxy;

})(Model);

module.exports = {
  ToolProxy: ToolProxy
};
