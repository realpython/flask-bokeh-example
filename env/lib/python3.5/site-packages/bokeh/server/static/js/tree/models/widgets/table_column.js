var CellEditors, CellFormatters, Model, TableColumn, _, p,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

CellEditors = require("./cell_editors");

CellFormatters = require("./cell_formatters");

p = require("../../core/properties");

Model = require("../../model");

TableColumn = (function(superClass) {
  extend(TableColumn, superClass);

  function TableColumn() {
    return TableColumn.__super__.constructor.apply(this, arguments);
  }

  TableColumn.prototype.type = 'TableColumn';

  TableColumn.prototype.default_view = null;

  TableColumn.define({
    field: [p.String],
    title: [p.String],
    width: [p.Number, 300],
    formatter: [
      p.Instance, function() {
        return new CellFormatters.String.Model();
      }
    ],
    editor: [
      p.Instance, function() {
        return new CellEditors.String.Model();
      }
    ],
    sortable: [p.Bool, true],
    default_sort: [p.String, "ascending"]
  });

  TableColumn.prototype.toColumn = function() {
    var ref;
    return {
      id: _.uniqueId(),
      field: this.field,
      name: this.title,
      width: this.width,
      formatter: (ref = this.formatter) != null ? ref.doFormat.bind(this.formatter) : void 0,
      editor: this.editor,
      sortable: this.sortable,
      defaultSortAsc: this.default_sort === "ascending"
    };
  };

  return TableColumn;

})(Model);

module.exports = {
  Model: TableColumn
};
