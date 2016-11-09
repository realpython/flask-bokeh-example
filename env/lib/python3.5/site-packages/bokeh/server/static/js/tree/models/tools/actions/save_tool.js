var ActionTool, SaveTool, SaveToolView, _,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

ActionTool = require("./action_tool");

SaveToolView = (function(superClass) {
  extend(SaveToolView, superClass);

  function SaveToolView() {
    return SaveToolView.__super__.constructor.apply(this, arguments);
  }

  SaveToolView.prototype["do"] = function() {
    var blob, canvas, link, name;
    canvas = this.plot_view.get_canvas_element();
    name = "bokeh_plot.png";
    if (canvas.msToBlob != null) {
      blob = canvas.msToBlob();
      return window.navigator.msSaveBlob(blob, name);
    } else {
      link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = name;
      link.target = "_blank";
      return link.dispatchEvent(new MouseEvent('click'));
    }
  };

  return SaveToolView;

})(ActionTool.View);

SaveTool = (function(superClass) {
  extend(SaveTool, superClass);

  function SaveTool() {
    return SaveTool.__super__.constructor.apply(this, arguments);
  }

  SaveTool.prototype.default_view = SaveToolView;

  SaveTool.prototype.type = "SaveTool";

  SaveTool.prototype.tool_name = "Save";

  SaveTool.prototype.icon = "bk-tool-icon-save";

  return SaveTool;

})(ActionTool.Model);

module.exports = {
  Model: SaveTool,
  View: SaveToolView
};
