var $, $1, CheckboxSelectColumn, DataProvider, DataTable, DataTableView, RowSelectionModel, SlickGrid, TableWidget, Widget, _, hittest, p, wait_for_element,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

$ = require("jquery");

$1 = require("jquery-ui/sortable");

SlickGrid = require("slick_grid/slick.grid");

RowSelectionModel = require("slick_grid/plugins/slick.rowselectionmodel");

CheckboxSelectColumn = require("slick_grid/plugins/slick.checkboxselectcolumn");

hittest = require("../../core/hittest");

p = require("../../core/properties");

TableWidget = require("./table_widget");

Widget = require("./widget");

wait_for_element = function(el, fn) {
  var handler, interval;
  handler = (function(_this) {
    return function() {
      if ($.contains(document.documentElement, el)) {
        clearInterval(interval);
        return fn();
      }
    };
  })(this);
  return interval = setInterval(handler, 50);
};

DataProvider = (function() {
  function DataProvider(source1) {
    var j, ref, results;
    this.source = source1;
    this.data = this.source.data;
    this.fields = _.keys(this.data);
    if (!_.contains(this.fields, "index")) {
      this.data["index"] = (function() {
        results = [];
        for (var j = 0, ref = this.getLength(); 0 <= ref ? j < ref : j > ref; 0 <= ref ? j++ : j--){ results.push(j); }
        return results;
      }).apply(this);
      this.fields.push("index");
    }
  }

  DataProvider.prototype.getLength = function() {
    return this.source.get_length();
  };

  DataProvider.prototype.getItem = function(offset) {
    var field, item, j, len, ref;
    item = {};
    ref = this.fields;
    for (j = 0, len = ref.length; j < len; j++) {
      field = ref[j];
      item[field] = this.data[field][offset];
    }
    return item;
  };

  DataProvider.prototype._setItem = function(offset, item) {
    var field, value;
    for (field in item) {
      value = item[field];
      this.data[field][offset] = value;
    }
  };

  DataProvider.prototype.setItem = function(offset, item) {
    this._setItem(offset, item);
    return this.updateSource();
  };

  DataProvider.prototype.getField = function(index, field) {
    var offset;
    offset = this.data["index"].indexOf(index);
    return this.data[field][offset];
  };

  DataProvider.prototype._setField = function(index, field, value) {
    var offset;
    offset = this.data["index"].indexOf(index);
    this.data[field][offset] = value;
  };

  DataProvider.prototype.setField = function(index, field, value) {
    this._setField(index, field, value);
    return this.updateSource();
  };

  DataProvider.prototype.updateSource = function() {
    return this.source.trigger("change:data", this, this.source.attributes['data']);
  };

  DataProvider.prototype.getItemMetadata = function(index) {
    return null;
  };

  DataProvider.prototype.getRecords = function() {
    var i;
    return (function() {
      var j, ref, results;
      results = [];
      for (i = j = 0, ref = this.getLength(); 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
        results.push(this.getItem(i));
      }
      return results;
    }).call(this);
  };

  DataProvider.prototype.sort = function(columns) {
    var cols, column, i, j, len, record, records;
    cols = (function() {
      var j, len, results;
      results = [];
      for (j = 0, len = columns.length; j < len; j++) {
        column = columns[j];
        results.push([column.sortCol.field, column.sortAsc ? 1 : -1]);
      }
      return results;
    })();
    if (_.isEmpty(cols)) {
      cols = [["index", 1]];
    }
    records = this.getRecords();
    records.sort(function(record1, record2) {
      var field, j, len, ref, result, sign, value1, value2;
      for (j = 0, len = cols.length; j < len; j++) {
        ref = cols[j], field = ref[0], sign = ref[1];
        value1 = record1[field];
        value2 = record2[field];
        result = value1 === value2 ? 0 : value1 > value2 ? sign : -sign;
        if (result !== 0) {
          return result;
        }
      }
      return 0;
    });
    for (i = j = 0, len = records.length; j < len; i = ++j) {
      record = records[i];
      this._setItem(i, record);
    }
    return this.updateSource();
  };

  return DataProvider;

})();

DataTableView = (function(superClass) {
  extend(DataTableView, superClass);

  function DataTableView() {
    return DataTableView.__super__.constructor.apply(this, arguments);
  }

  DataTableView.prototype.attributes = {
    "class": "bk-data-table"
  };

  DataTableView.prototype.initialize = function(options) {
    var source;
    DataTableView.__super__.initialize.call(this, options);
    wait_for_element(this.el, (function(_this) {
      return function() {
        return _this.render();
      };
    })(this));
    this.listenTo(this.model, 'change', (function(_this) {
      return function() {
        return _this.render();
      };
    })(this));
    source = this.model.source;
    this.listenTo(source, 'change:data', (function(_this) {
      return function() {
        return _this.updateGrid();
      };
    })(this));
    return this.listenTo(source, 'change:selected', (function(_this) {
      return function() {
        return _this.updateSelection();
      };
    })(this));
  };

  DataTableView.prototype.updateGrid = function() {
    this.data.constructor(this.model.source);
    this.grid.invalidate();
    this.grid.render();
    this.model.source.data = this.model.source.data;
    return this.model.source.trigger('change');
  };

  DataTableView.prototype.updateSelection = function() {
    var cur_grid_range, indices, min_index, selected;
    selected = this.model.source.selected;
    indices = selected['1d'].indices;
    this.grid.setSelectedRows(indices);
    cur_grid_range = this.grid.getViewport();
    if (this.model.scroll_to_selection && !_.any(_.map(indices, function(index) {
      return cur_grid_range["top"] <= index && index <= cur_grid_range["bottom"];
    }))) {
      min_index = Math.max(0, Math.min.apply(null, indices) - 1);
      return this.grid.scrollRowToTop(min_index);
    }
  };

  DataTableView.prototype.newIndexColumn = function() {
    return {
      id: _.uniqueId(),
      name: "#",
      field: "index",
      width: 40,
      behavior: "select",
      cannotTriggerInsert: true,
      resizable: false,
      selectable: false,
      sortable: true,
      cssClass: "bk-cell-index"
    };
  };

  DataTableView.prototype.render = function() {
    var checkboxSelector, column, columns, height, options, width;
    columns = (function() {
      var j, len, ref, results;
      ref = this.model.columns;
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        column = ref[j];
        results.push(column.toColumn());
      }
      return results;
    }).call(this);
    if (this.model.selectable === "checkbox") {
      checkboxSelector = new CheckboxSelectColumn({
        cssClass: "bk-cell-select"
      });
      columns.unshift(checkboxSelector.getColumnDefinition());
    }
    if (this.model.row_headers && (this.model.source.get_column("index") != null)) {
      columns.unshift(this.newIndexColumn());
    }
    width = this.model.width;
    height = this.model.height;
    options = {
      enableCellNavigation: this.model.selectable !== false,
      enableColumnReorder: true,
      forceFitColumns: this.model.fit_columns,
      autoHeight: height === "auto",
      multiColumnSort: this.model.sortable,
      editable: this.model.editable,
      autoEdit: false
    };
    if (width != null) {
      this.$el.css({
        width: this.model.width + "px"
      });
    } else {
      this.$el.css({
        width: this.model.default_width + "px"
      });
    }
    if ((height != null) && height !== "auto") {
      this.$el.css({
        height: this.model.height + "px"
      });
    }
    this.data = new DataProvider(this.model.source);
    this.grid = new SlickGrid(this.el, this.data, columns, options);
    this.grid.onSort.subscribe((function(_this) {
      return function(event, args) {
        columns = args.sortCols;
        _this.data.sort(columns);
        _this.grid.invalidate();
        return _this.grid.render();
      };
    })(this));
    if (this.model.selectable !== false) {
      this.grid.setSelectionModel(new RowSelectionModel({
        selectActiveRow: checkboxSelector == null
      }));
      if (checkboxSelector != null) {
        this.grid.registerPlugin(checkboxSelector);
      }
      this.grid.onSelectedRowsChanged.subscribe((function(_this) {
        return function(event, args) {
          var selected;
          selected = hittest.create_hit_test_result();
          selected['1d'].indices = args.rows;
          return _this.model.source.selected = selected;
        };
      })(this));
    }
    return this;
  };

  return DataTableView;

})(Widget.View);

DataTable = (function(superClass) {
  extend(DataTable, superClass);

  function DataTable() {
    return DataTable.__super__.constructor.apply(this, arguments);
  }

  DataTable.prototype.type = 'DataTable';

  DataTable.prototype.default_view = DataTableView;

  DataTable.define({
    columns: [p.Array, []],
    fit_columns: [p.Bool, true],
    sortable: [p.Bool, true],
    editable: [p.Bool, false],
    selectable: [p.Bool, true],
    row_headers: [p.Bool, true],
    scroll_to_selection: [p.Bool, true]
  });

  DataTable.override({
    height: 400
  });

  DataTable.internal({
    default_width: [p.Number, 600]
  });

  return DataTable;

})(TableWidget.Model);

module.exports = {
  Model: DataTable,
  View: DataTableView
};
