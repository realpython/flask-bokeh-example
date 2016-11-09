var ActionTool, UndoTool, UndoToolView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ActionTool = require("./action_tool");

UndoToolView = (function(superClass) {
  extend(UndoToolView, superClass);

  function UndoToolView() {
    return UndoToolView.__super__.constructor.apply(this, arguments);
  }

  UndoToolView.prototype.initialize = function(options) {
    UndoToolView.__super__.initialize.call(this, options);
    return this.listenTo(this.plot_view, "state_changed", (function(_this) {
      return function() {
        return _this.model.disabled = !_this.plot_view.can_undo();
      };
    })(this));
  };

  UndoToolView.prototype["do"] = function() {
    return this.plot_view.undo();
  };

  return UndoToolView;

})(ActionTool.View);

UndoTool = (function(superClass) {
  extend(UndoTool, superClass);

  function UndoTool() {
    return UndoTool.__super__.constructor.apply(this, arguments);
  }

  UndoTool.prototype.default_view = UndoToolView;

  UndoTool.prototype.type = "UndoTool";

  UndoTool.prototype.tool_name = "Undo";

  UndoTool.prototype.icon = "bk-tool-icon-undo";

  UndoTool.override({
    disabled: true
  });

  return UndoTool;

})(ActionTool.Model);

module.exports = {
  Model: UndoTool,
  View: UndoToolView
};
