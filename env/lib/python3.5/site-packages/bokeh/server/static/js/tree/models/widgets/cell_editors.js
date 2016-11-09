var $, $1, $2, BokehView, CellEditor, CellEditorView, CheckboxEditor, CheckboxEditorView, DateEditor, DateEditorView, IntEditor, IntEditorView, Model, NumberEditor, NumberEditorView, PercentEditor, PercentEditorView, SelectEditor, SelectEditorView, StringEditor, StringEditorView, TextEditor, TextEditorView, TimeEditor, TimeEditorView, _, p,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

$ = require("jquery");

$1 = require("jquery-ui/autocomplete");

$2 = require("jquery-ui/spinner");

p = require("../../core/properties");

BokehView = require("../../core/bokeh_view");

Model = require("../../model");

CellEditorView = (function(superClass) {
  extend(CellEditorView, superClass);

  function CellEditorView() {
    return CellEditorView.__super__.constructor.apply(this, arguments);
  }

  CellEditorView.prototype.tagName = "div";

  CellEditorView.prototype.attributes = {
    "class": "bk-cell-editor"
  };

  CellEditorView.prototype.input = null;

  CellEditorView.prototype.emptyValue = null;

  CellEditorView.prototype.defaultValue = null;

  CellEditorView.prototype.initialize = function(args) {
    this.args = args;
    this.model = this.args.column.editor;
    CellEditorView.__super__.initialize.call(this);
    return this.render();
  };

  CellEditorView.prototype.render = function() {
    CellEditorView.__super__.render.call(this);
    this.$el.appendTo(this.args.container);
    this.$input = $(this.input);
    this.$el.append(this.$input);
    this.renderEditor();
    this.disableNavigation();
    return this;
  };

  CellEditorView.prototype.renderEditor = function() {};

  CellEditorView.prototype.disableNavigation = function() {
    return this.$input.keydown((function(_this) {
      return function(event) {
        var stop;
        stop = function() {
          return event.stopImmediatePropagation();
        };
        switch (event.keyCode) {
          case $.ui.keyCode.LEFT:
            return stop();
          case $.ui.keyCode.RIGHT:
            return stop();
          case $.ui.keyCode.UP:
            return stop();
          case $.ui.keyCode.DOWN:
            return stop();
          case $.ui.keyCode.PAGE_UP:
            return stop();
          case $.ui.keyCode.PAGE_DOWN:
            return stop();
        }
      };
    })(this));
  };

  CellEditorView.prototype.destroy = function() {
    return this.remove();
  };

  CellEditorView.prototype.focus = function() {
    return this.$input.focus();
  };

  CellEditorView.prototype.show = function() {};

  CellEditorView.prototype.hide = function() {};

  CellEditorView.prototype.position = function() {};

  CellEditorView.prototype.getValue = function() {
    return this.$input.val();
  };

  CellEditorView.prototype.setValue = function(val) {
    return this.$input.val(val);
  };

  CellEditorView.prototype.serializeValue = function() {
    return this.getValue();
  };

  CellEditorView.prototype.isValueChanged = function() {
    return !(this.getValue() === "" && (this.defaultValue == null)) && (this.getValue() !== this.defaultValue);
  };

  CellEditorView.prototype.applyValue = function(item, state) {
    return this.args.grid.getData().setField(item.index, this.args.column.field, state);
  };

  CellEditorView.prototype.loadValue = function(item) {
    var value;
    value = item[this.args.column.field];
    this.defaultValue = value != null ? value : this.emptyValue;
    return this.setValue(this.defaultValue);
  };

  CellEditorView.prototype.validateValue = function(value) {
    var result;
    if (this.args.column.validator) {
      result = this.args.column.validator(value);
      if (!result.valid) {
        return result;
      }
    }
    return {
      valid: true,
      msg: null
    };
  };

  CellEditorView.prototype.validate = function() {
    return this.validateValue(this.getValue());
  };

  return CellEditorView;

})(BokehView);

CellEditor = (function(superClass) {
  extend(CellEditor, superClass);

  function CellEditor() {
    return CellEditor.__super__.constructor.apply(this, arguments);
  }

  CellEditor.prototype.type = "CellEditor";

  CellEditor.prototype.default_view = CellEditorView;

  return CellEditor;

})(Model);

StringEditorView = (function(superClass) {
  extend(StringEditorView, superClass);

  function StringEditorView() {
    return StringEditorView.__super__.constructor.apply(this, arguments);
  }

  StringEditorView.prototype.emptyValue = "";

  StringEditorView.prototype.input = '<input type="text" />';

  StringEditorView.prototype.renderEditor = function() {
    var completions;
    completions = this.model.completions;
    if (!_.isEmpty(completions)) {
      this.$input.autocomplete({
        source: completions
      });
      this.$input.autocomplete("widget").addClass("bk-cell-editor-completion");
    }
    return this.$input.focus().select();
  };

  StringEditorView.prototype.loadValue = function(item) {
    StringEditorView.__super__.loadValue.call(this, item);
    this.$input[0].defaultValue = this.defaultValue;
    return this.$input.select();
  };

  return StringEditorView;

})(CellEditorView);

StringEditor = (function(superClass) {
  extend(StringEditor, superClass);

  function StringEditor() {
    return StringEditor.__super__.constructor.apply(this, arguments);
  }

  StringEditor.prototype.type = 'StringEditor';

  StringEditor.prototype.default_view = StringEditorView;

  StringEditor.define({
    completions: [p.Array, []]
  });

  return StringEditor;

})(CellEditor);

TextEditorView = (function(superClass) {
  extend(TextEditorView, superClass);

  function TextEditorView() {
    return TextEditorView.__super__.constructor.apply(this, arguments);
  }

  return TextEditorView;

})(CellEditorView);

TextEditor = (function(superClass) {
  extend(TextEditor, superClass);

  function TextEditor() {
    return TextEditor.__super__.constructor.apply(this, arguments);
  }

  TextEditor.prototype.type = 'TextEditor';

  TextEditor.prototype.default_view = TextEditorView;

  return TextEditor;

})(CellEditor);

SelectEditorView = (function(superClass) {
  extend(SelectEditorView, superClass);

  function SelectEditorView() {
    return SelectEditorView.__super__.constructor.apply(this, arguments);
  }

  SelectEditorView.prototype.input = '<select />';

  SelectEditorView.prototype.renderEditor = function() {
    var i, len, option, ref;
    ref = this.model.options;
    for (i = 0, len = ref.length; i < len; i++) {
      option = ref[i];
      this.$input.append($('<option>').attr({
        value: option
      }).text(option));
    }
    return this.focus();
  };

  SelectEditorView.prototype.loadValue = function(item) {
    SelectEditorView.__super__.loadValue.call(this, item);
    return this.$input.select();
  };

  return SelectEditorView;

})(CellEditorView);

SelectEditor = (function(superClass) {
  extend(SelectEditor, superClass);

  function SelectEditor() {
    return SelectEditor.__super__.constructor.apply(this, arguments);
  }

  SelectEditor.prototype.type = 'SelectEditor';

  SelectEditor.prototype.default_view = SelectEditorView;

  SelectEditor.define({
    options: [p.Array, []]
  });

  return SelectEditor;

})(CellEditor);

PercentEditorView = (function(superClass) {
  extend(PercentEditorView, superClass);

  function PercentEditorView() {
    return PercentEditorView.__super__.constructor.apply(this, arguments);
  }

  return PercentEditorView;

})(CellEditorView);

PercentEditor = (function(superClass) {
  extend(PercentEditor, superClass);

  function PercentEditor() {
    return PercentEditor.__super__.constructor.apply(this, arguments);
  }

  PercentEditor.prototype.type = 'PercentEditor';

  PercentEditor.prototype.default_view = PercentEditorView;

  return PercentEditor;

})(CellEditor);

CheckboxEditorView = (function(superClass) {
  extend(CheckboxEditorView, superClass);

  function CheckboxEditorView() {
    return CheckboxEditorView.__super__.constructor.apply(this, arguments);
  }

  CheckboxEditorView.prototype.input = '<input type="checkbox" value="true" />';

  CheckboxEditorView.prototype.renderEditor = function() {
    return this.focus();
  };

  CheckboxEditorView.prototype.loadValue = function(item) {
    this.defaultValue = !!item[this.args.column.field];
    return this.$input.prop('checked', this.defaultValue);
  };

  CheckboxEditorView.prototype.serializeValue = function() {
    return this.$input.prop('checked');
  };

  return CheckboxEditorView;

})(CellEditorView);

CheckboxEditor = (function(superClass) {
  extend(CheckboxEditor, superClass);

  function CheckboxEditor() {
    return CheckboxEditor.__super__.constructor.apply(this, arguments);
  }

  CheckboxEditor.prototype.type = 'CheckboxEditor';

  CheckboxEditor.prototype.default_view = CheckboxEditorView;

  return CheckboxEditor;

})(CellEditor);

IntEditorView = (function(superClass) {
  extend(IntEditorView, superClass);

  function IntEditorView() {
    return IntEditorView.__super__.constructor.apply(this, arguments);
  }

  IntEditorView.prototype.input = '<input type="text" />';

  IntEditorView.prototype.renderEditor = function() {
    this.$input.spinner({
      step: this.model.step
    });
    return this.$input.focus().select();
  };

  IntEditorView.prototype.remove = function() {
    this.$input.spinner("destroy");
    return IntEditorView.__super__.remove.call(this);
  };

  IntEditorView.prototype.serializeValue = function() {
    return parseInt(this.getValue(), 10) || 0;
  };

  IntEditorView.prototype.loadValue = function(item) {
    IntEditorView.__super__.loadValue.call(this, item);
    this.$input[0].defaultValue = this.defaultValue;
    return this.$input.select();
  };

  IntEditorView.prototype.validateValue = function(value) {
    if (isNaN(value)) {
      return {
        valid: false,
        msg: "Please enter a valid integer"
      };
    } else {
      return IntEditorView.__super__.validateValue.call(this, value);
    }
  };

  return IntEditorView;

})(CellEditorView);

IntEditor = (function(superClass) {
  extend(IntEditor, superClass);

  function IntEditor() {
    return IntEditor.__super__.constructor.apply(this, arguments);
  }

  IntEditor.prototype.type = 'IntEditor';

  IntEditor.prototype.default_view = IntEditorView;

  IntEditor.define({
    step: [p.Number, 1]
  });

  return IntEditor;

})(CellEditor);

NumberEditorView = (function(superClass) {
  extend(NumberEditorView, superClass);

  function NumberEditorView() {
    return NumberEditorView.__super__.constructor.apply(this, arguments);
  }

  NumberEditorView.prototype.input = '<input type="text" />';

  NumberEditorView.prototype.renderEditor = function() {
    this.$input.spinner({
      step: this.model.step
    });
    return this.$input.focus().select();
  };

  NumberEditorView.prototype.remove = function() {
    this.$input.spinner("destroy");
    return NumberEditorView.__super__.remove.call(this);
  };

  NumberEditorView.prototype.serializeValue = function() {
    return parseFloat(this.getValue()) || 0.0;
  };

  NumberEditorView.prototype.loadValue = function(item) {
    NumberEditorView.__super__.loadValue.call(this, item);
    this.$input[0].defaultValue = this.defaultValue;
    return this.$input.select();
  };

  NumberEditorView.prototype.validateValue = function(value) {
    if (isNaN(value)) {
      return {
        valid: false,
        msg: "Please enter a valid number"
      };
    } else {
      return NumberEditorView.__super__.validateValue.call(this, value);
    }
  };

  return NumberEditorView;

})(CellEditorView);

NumberEditor = (function(superClass) {
  extend(NumberEditor, superClass);

  function NumberEditor() {
    return NumberEditor.__super__.constructor.apply(this, arguments);
  }

  NumberEditor.prototype.type = 'NumberEditor';

  NumberEditor.prototype.default_view = NumberEditorView;

  NumberEditor.define({
    step: [p.Number, 0.01]
  });

  return NumberEditor;

})(CellEditor);

TimeEditorView = (function(superClass) {
  extend(TimeEditorView, superClass);

  function TimeEditorView() {
    return TimeEditorView.__super__.constructor.apply(this, arguments);
  }

  return TimeEditorView;

})(CellEditorView);

TimeEditor = (function(superClass) {
  extend(TimeEditor, superClass);

  function TimeEditor() {
    return TimeEditor.__super__.constructor.apply(this, arguments);
  }

  TimeEditor.prototype.type = 'TimeEditor';

  TimeEditor.prototype.default_view = TimeEditorView;

  return TimeEditor;

})(CellEditor);

DateEditorView = (function(superClass) {
  extend(DateEditorView, superClass);

  function DateEditorView() {
    return DateEditorView.__super__.constructor.apply(this, arguments);
  }

  DateEditorView.prototype.emptyValue = new Date();

  DateEditorView.prototype.input = '<input type="text" />';

  DateEditorView.prototype.renderEditor = function() {
    this.calendarOpen = false;
    this.$input.datepicker({
      showOn: "button",
      buttonImageOnly: true,
      beforeShow: (function(_this) {
        return function() {
          return _this.calendarOpen = true;
        };
      })(this),
      onClose: (function(_this) {
        return function() {
          return _this.calendarOpen = false;
        };
      })(this)
    });
    this.$input.siblings(".bk-ui-datepicker-trigger").css({
      "vertical-align": "middle"
    });
    this.$input.width(this.$input.width() - (14 + 2 * 4 + 4));
    return this.$input.focus().select();
  };

  DateEditorView.prototype.destroy = function() {
    $.datepicker.dpDiv.stop(true, true);
    this.$input.datepicker("hide");
    this.$input.datepicker("destroy");
    return DateEditorView.__super__.destroy.call(this);
  };

  DateEditorView.prototype.show = function() {
    if (this.calendarOpen) {
      $.datepicker.dpDiv.stop(true, true).show();
    }
    return DateEditorView.__super__.show.call(this);
  };

  DateEditorView.prototype.hide = function() {
    if (this.calendarOpen) {
      $.datepicker.dpDiv.stop(true, true).hide();
    }
    return DateEditorView.__super__.hide.call(this);
  };

  DateEditorView.prototype.position = function(position) {
    if (this.calendarOpen) {
      $.datepicker.dpDiv.css({
        top: position.top + 30,
        left: position.left
      });
    }
    return DateEditorView.__super__.position.call(this);
  };

  DateEditorView.prototype.getValue = function() {
    return this.$input.datepicker("getDate").getTime();
  };

  DateEditorView.prototype.setValue = function(val) {
    return this.$input.datepicker("setDate", new Date(val));
  };

  return DateEditorView;

})(CellEditorView);

DateEditor = (function(superClass) {
  extend(DateEditor, superClass);

  function DateEditor() {
    return DateEditor.__super__.constructor.apply(this, arguments);
  }

  DateEditor.prototype.type = 'DateEditor';

  DateEditor.prototype.default_view = DateEditorView;

  return DateEditor;

})(CellEditor);

module.exports = {
  String: {
    Model: StringEditor,
    View: StringEditorView
  },
  Text: {
    Model: TextEditor,
    View: TextEditorView
  },
  Select: {
    Model: SelectEditor,
    View: SelectEditorView
  },
  Percent: {
    Model: PercentEditor,
    View: PercentEditorView
  },
  Checkbox: {
    Model: CheckboxEditor,
    View: CheckboxEditorView
  },
  Int: {
    Model: IntEditor,
    View: IntEditorView
  },
  Number: {
    Model: NumberEditor,
    View: NumberEditorView
  },
  Time: {
    Model: TimeEditor,
    View: TimeEditorView
  },
  Date: {
    Model: DateEditor,
    View: DateEditorView
  }
};
