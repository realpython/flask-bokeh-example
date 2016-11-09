var Box, BoxView, EQ, GE, LayoutDOM, Strength, Variable, WEAK_EQ, _, p, ref,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

_ = require("underscore");

ref = require("../../core/layout/solver"), EQ = ref.EQ, GE = ref.GE, Strength = ref.Strength, Variable = ref.Variable, WEAK_EQ = ref.WEAK_EQ;

p = require("../../core/properties");

LayoutDOM = require("./layout_dom");

BoxView = (function(superClass) {
  extend(BoxView, superClass);

  function BoxView() {
    return BoxView.__super__.constructor.apply(this, arguments);
  }

  BoxView.prototype.className = "bk-grid";

  BoxView.prototype.bind_bokeh_events = function() {
    BoxView.__super__.bind_bokeh_events.call(this);
    return this.listenTo(this.model, 'change:children', this.build_child_views);
  };

  BoxView.prototype.get_height = function() {
    var child_heights, children, height;
    children = this.model.get_layoutable_children();
    child_heights = _.map(children, (function(child) {
      return child._height._value;
    }));
    if (this.model._horizontal) {
      height = _.reduce(child_heights, (function(a, b) {
        return Math.max(a, b);
      }));
    } else {
      height = _.reduce(child_heights, (function(a, b) {
        return a + b;
      }));
    }
    return height;
  };

  BoxView.prototype.get_width = function() {
    var child_widths, children, width;
    children = this.model.get_layoutable_children();
    child_widths = _.map(children, (function(child) {
      return child._width._value;
    }));
    if (this.model._horizontal) {
      width = _.reduce(child_widths, (function(a, b) {
        return a + b;
      }));
    } else {
      width = _.reduce(child_widths, (function(a, b) {
        return Math.max(a, b);
      }));
    }
    return width;
  };

  return BoxView;

})(LayoutDOM.View);

Box = (function(superClass) {
  extend(Box, superClass);

  Box.prototype.default_view = BoxView;

  function Box(attrs, options) {
    Box.__super__.constructor.call(this, attrs, options);
    this._child_equal_size_width = new Variable();
    this._child_equal_size_height = new Variable();
    this._box_equal_size_top = new Variable();
    this._box_equal_size_bottom = new Variable();
    this._box_equal_size_left = new Variable();
    this._box_equal_size_right = new Variable();
    this._box_cell_align_top = new Variable();
    this._box_cell_align_bottom = new Variable();
    this._box_cell_align_left = new Variable();
    this._box_cell_align_right = new Variable();
  }

  Box.define({
    children: [p.Array, []]
  });

  Box.internal({
    spacing: [p.Number, 6]
  });

  Box.prototype.get_layoutable_children = function() {
    return this.children;
  };

  Box.prototype.variables_updated = function() {
    var child, j, len, ref1;
    ref1 = this.get_layoutable_children();
    for (j = 0, len = ref1.length; j < len; j++) {
      child = ref1[j];
      child.trigger('change');
    }
    return this.trigger('change');
  };

  Box.prototype.get_edit_variables = function() {
    var child, edit_variables, j, len, ref1;
    edit_variables = Box.__super__.get_edit_variables.call(this);
    ref1 = this.get_layoutable_children();
    for (j = 0, len = ref1.length; j < len; j++) {
      child = ref1[j];
      edit_variables = edit_variables.concat(child.get_edit_variables());
    }
    return edit_variables;
  };

  Box.prototype.get_constrained_variables = function() {
    var constrained_variables;
    constrained_variables = Box.__super__.get_constrained_variables.call(this);
    constrained_variables = _.extend(constrained_variables, {
      'box-equal-size-top': this._box_equal_size_top,
      'box-equal-size-bottom': this._box_equal_size_bottom,
      'box-equal-size-left': this._box_equal_size_left,
      'box-equal-size-right': this._box_equal_size_right,
      'box-cell-align-top': this._box_cell_align_top,
      'box-cell-align-bottom': this._box_cell_align_bottom,
      'box-cell-align-left': this._box_cell_align_left,
      'box-cell-align-right': this._box_cell_align_right
    });
    return constrained_variables;
  };

  Box.prototype.get_constraints = function() {
    var child, children, constraints, i, j, k, last, len, next, rect, ref1, var_keys, vars;
    constraints = [];
    children = this.get_layoutable_children();
    if (children.length === 0) {
      return constraints;
    }
    for (j = 0, len = children.length; j < len; j++) {
      child = children[j];
      this._test_layoutable(child);
      vars = child.get_constrained_variables();
      var_keys = _.keys(vars);
      rect = this._child_rect(vars);
      if (this._horizontal) {
        if (this._has_var('height', var_keys)) {
          constraints.push(EQ(rect.height, [-1, this._height]));
        }
      } else {
        if (this._has_var('width', var_keys)) {
          constraints.push(EQ(rect.width, [-1, this._width]));
        }
      }
      if (this._horizontal) {
        if (this._has_var(['box-equal-size-left', 'box-equal-size-right', 'width'], var_keys)) {
          constraints.push(EQ([-1, vars['box-equal-size-left']], [-1, vars['box-equal-size-right']], vars['width'], this._child_equal_size_width));
        }
      } else {
        if (this._has_var(['box-equal-size-top', 'box-equal-size-bottom', 'height'], var_keys)) {
          constraints.push(EQ([-1, vars['box-equal-size-top']], [-1, vars['box-equal-size-bottom']], vars['height'], this._child_equal_size_height));
        }
      }
      constraints = constraints.concat(child.get_constraints());
    }
    last = this._info(children[0].get_constrained_variables());
    constraints.push(EQ(last.span.start, 0));
    for (i = k = 1, ref1 = children.length; 1 <= ref1 ? k < ref1 : k > ref1; i = 1 <= ref1 ? ++k : --k) {
      next = this._info(children[i].get_constrained_variables());
      if (last.span.size) {
        constraints.push(EQ(last.span.start, last.span.size, [-1, next.span.start]));
      }
      constraints.push(WEAK_EQ(last.whitespace.after, next.whitespace.before, 0 - this.spacing));
      constraints.push(GE(last.whitespace.after, next.whitespace.before, 0 - this.spacing));
      last = next;
    }
    if (this._horizontal) {
      if (this._has_var('width', var_keys)) {
        constraints.push(EQ(last.span.start, last.span.size, [-1, this._width]));
      }
    } else {
      if (this._has_var('height', var_keys)) {
        constraints.push(EQ(last.span.start, last.span.size, [-1, this._height]));
      }
    }
    constraints = constraints.concat(this._align_outer_edges_constraints(true));
    constraints = constraints.concat(this._align_outer_edges_constraints(false));
    constraints = constraints.concat(this._align_inner_cell_edges_constraints());
    constraints = constraints.concat(this._box_equal_size_bounds(true));
    constraints = constraints.concat(this._box_equal_size_bounds(false));
    constraints = constraints.concat(this._box_cell_align_bounds(true));
    constraints = constraints.concat(this._box_cell_align_bounds(false));
    constraints = constraints.concat(this._box_whitespace(true));
    constraints = constraints.concat(this._box_whitespace(false));
    return constraints;
  };

  Box.prototype._has_var = function(look_up, var_keys) {
    var look_up_list;
    if (typeof look_up === 'string') {
      look_up_list = [look_up];
    } else {
      look_up_list = look_up;
    }
    return _.every(look_up_list, function(x) {
      return indexOf.call(var_keys, x) >= 0;
    });
  };

  Box.prototype._test_layoutable = function(child) {
    var j, key, len, required_constrained_variables, vars;
    required_constrained_variables = ['origin-x', 'origin-y', 'whitespace-top', 'whitespace-right', 'whitespace-bottom', 'whitespace-left'];
    if (child.get_constrained_variables == null) {
      throw new Error(child + " is missing get_constrained_variables method");
    }
    vars = child.get_constrained_variables();
    for (j = 0, len = required_constrained_variables.length; j < len; j++) {
      key = required_constrained_variables[j];
      if (indexOf.call(_.keys(vars), key) < 0) {
        throw new Error(child + " is missing constrained_variable " + key);
      }
      if (!vars[key] instanceof Variable) {
        throw new Error(child + " " + key + " is not a solver Variable");
      }
    }
    return true;
  };

  Box.prototype._child_rect = function(vars) {
    var height, ref1, width, x, y;
    width = vars['width'];
    height = vars['height'];
    ref1 = [vars['origin-x'], vars['origin-y']], x = ref1[0], y = ref1[1];
    return {
      x: x,
      y: y,
      width: width,
      height: height
    };
  };

  Box.prototype._span = function(rect) {
    if (this._horizontal) {
      return {
        start: rect.x,
        size: rect.width
      };
    } else {
      return {
        start: rect.y,
        size: rect.height
      };
    }
  };

  Box.prototype._info = function(vars) {
    var span, whitespace;
    if (this._horizontal) {
      whitespace = {
        before: vars['whitespace-left'],
        after: vars['whitespace-right']
      };
    } else {
      whitespace = {
        before: vars['whitespace-top'],
        after: vars['whitespace-bottom']
      };
    }
    span = this._span(this._child_rect(vars));
    return {
      span: span,
      whitespace: whitespace
    };
  };

  Box.prototype._flatten_cell_edge_variables = function(horizontal) {
    var add_path, all_vars, arity, cell, cell_vars, child, children, direction, flattened, j, k, key, kind, len, len1, name, new_key, parsed, path, relevant_edges, variables;
    if (horizontal) {
      relevant_edges = Box._top_bottom_inner_cell_edge_variables;
    } else {
      relevant_edges = Box._left_right_inner_cell_edge_variables;
    }
    add_path = horizontal !== this._horizontal;
    children = this.get_layoutable_children();
    arity = children.length;
    flattened = {};
    cell = 0;
    for (j = 0, len = children.length; j < len; j++) {
      child = children[j];
      if (child instanceof Box) {
        cell_vars = child._flatten_cell_edge_variables(horizontal);
      } else {
        cell_vars = {};
      }
      all_vars = child.get_constrained_variables();
      for (k = 0, len1 = relevant_edges.length; k < len1; k++) {
        name = relevant_edges[k];
        if (name in all_vars) {
          cell_vars[name] = [all_vars[name]];
        }
      }
      for (key in cell_vars) {
        variables = cell_vars[key];
        if (add_path) {
          parsed = key.split(" ");
          kind = parsed[0];
          if (parsed.length > 1) {
            path = parsed[1];
          } else {
            path = "";
          }
          if (this._horizontal) {
            direction = "row";
          } else {
            direction = "col";
          }
          new_key = kind + " " + direction + "-" + arity + "-" + cell + "-" + path;
        } else {
          new_key = key;
        }
        if (new_key in flattened) {
          flattened[new_key] = flattened[new_key].concat(variables);
        } else {
          flattened[new_key] = variables;
        }
      }
      cell = cell + 1;
    }
    return flattened;
  };

  Box.prototype._align_inner_cell_edges_constraints = function() {
    var constraints, flattened, i, j, key, last, ref1, variables;
    constraints = [];
    if (this._is_root) {
      flattened = this._flatten_cell_edge_variables(this._horizontal);
      for (key in flattened) {
        variables = flattened[key];
        if (variables.length > 1) {
          last = variables[0];
          for (i = j = 1, ref1 = variables.length; 1 <= ref1 ? j < ref1 : j > ref1; i = 1 <= ref1 ? ++j : --j) {
            constraints.push(EQ(variables[i], [-1, last]));
          }
        }
      }
    }
    return constraints;
  };

  Box.prototype._find_edge_leaves = function(horizontal) {
    var child, child_leaves, children, end, j, leaves, len, start;
    children = this.get_layoutable_children();
    leaves = [[], []];
    if (children.length > 0) {
      if (this._horizontal === horizontal) {
        start = children[0];
        end = children[children.length - 1];
        if (start instanceof Box) {
          leaves[0] = leaves[0].concat(start._find_edge_leaves(horizontal)[0]);
        } else {
          leaves[0].push(start);
        }
        if (end instanceof Box) {
          leaves[1] = leaves[1].concat(end._find_edge_leaves(horizontal)[1]);
        } else {
          leaves[1].push(end);
        }
      } else {
        for (j = 0, len = children.length; j < len; j++) {
          child = children[j];
          if (child instanceof Box) {
            child_leaves = child._find_edge_leaves(horizontal);
            leaves[0] = leaves[0].concat(child_leaves[0]);
            leaves[1] = leaves[1].concat(child_leaves[1]);
          } else {
            leaves[0].push(child);
            leaves[1].push(child);
          }
        }
      }
    }
    return leaves;
  };

  Box.prototype._align_outer_edges_constraints = function(horizontal) {
    var add_all_equal, collect_vars, end_edges, end_leaves, end_variable, ref1, result, start_edges, start_leaves, start_variable;
    ref1 = this._find_edge_leaves(horizontal), start_leaves = ref1[0], end_leaves = ref1[1];
    if (horizontal) {
      start_variable = 'on-edge-align-left';
      end_variable = 'on-edge-align-right';
    } else {
      start_variable = 'on-edge-align-top';
      end_variable = 'on-edge-align-bottom';
    }
    collect_vars = function(leaves, name) {
      var edges, j, leaf, len, vars;
      edges = [];
      for (j = 0, len = leaves.length; j < len; j++) {
        leaf = leaves[j];
        vars = leaf.get_constrained_variables();
        if (name in vars) {
          edges.push(vars[name]);
        }
      }
      return edges;
    };
    start_edges = collect_vars(start_leaves, start_variable);
    end_edges = collect_vars(end_leaves, end_variable);
    result = [];
    add_all_equal = function(edges) {
      var edge, first, i, j, ref2;
      if (edges.length > 1) {
        first = edges[0];
        for (i = j = 1, ref2 = edges.length; 1 <= ref2 ? j < ref2 : j > ref2; i = 1 <= ref2 ? ++j : --j) {
          edge = edges[i];
          result.push(EQ([-1, first], edge));
        }
        return null;
      }
    };
    add_all_equal(start_edges);
    add_all_equal(end_edges);
    return result;
  };

  Box.prototype._box_insets_from_child_insets = function(horizontal, child_variable_prefix, our_variable_prefix, minimum) {
    var add_constraints, end_leaves, end_variable, our_end, our_start, ref1, result, start_leaves, start_variable;
    ref1 = this._find_edge_leaves(horizontal), start_leaves = ref1[0], end_leaves = ref1[1];
    if (horizontal) {
      start_variable = child_variable_prefix + "-left";
      end_variable = child_variable_prefix + "-right";
      our_start = this[our_variable_prefix + "_left"];
      our_end = this[our_variable_prefix + "_right"];
    } else {
      start_variable = child_variable_prefix + "-top";
      end_variable = child_variable_prefix + "-bottom";
      our_start = this[our_variable_prefix + "_top"];
      our_end = this[our_variable_prefix + "_bottom"];
    }
    result = [];
    add_constraints = function(ours, leaves, name) {
      var edges, j, leaf, len, vars;
      edges = [];
      for (j = 0, len = leaves.length; j < len; j++) {
        leaf = leaves[j];
        vars = leaf.get_constrained_variables();
        if (name in vars) {
          if (minimum) {
            result.push(GE([-1, ours], vars[name]));
          } else {
            result.push(EQ([-1, ours], vars[name]));
          }
        }
      }
      return null;
    };
    add_constraints(our_start, start_leaves, start_variable);
    add_constraints(our_end, end_leaves, end_variable);
    return result;
  };

  Box.prototype._box_equal_size_bounds = function(horizontal) {
    return this._box_insets_from_child_insets(horizontal, 'box-equal-size', '_box_equal_size', false);
  };

  Box.prototype._box_cell_align_bounds = function(horizontal) {
    return this._box_insets_from_child_insets(horizontal, 'box-cell-align', '_box_cell_align', false);
  };

  Box.prototype._box_whitespace = function(horizontal) {
    return this._box_insets_from_child_insets(horizontal, 'whitespace', '_whitespace', true);
  };

  Box._left_right_inner_cell_edge_variables = ['box-cell-align-left', 'box-cell-align-right'];

  Box._top_bottom_inner_cell_edge_variables = ['box-cell-align-top', 'box-cell-align-bottom'];

  return Box;

})(LayoutDOM.Model);

module.exports = {
  Model: Box,
  View: BoxView
};
