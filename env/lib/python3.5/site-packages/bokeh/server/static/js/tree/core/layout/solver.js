var Constraint, Events, Expression, Operator, Solver, Strength, Variable, _, _constrainer, _weak_constrainer, kiwi;

_ = require("underscore");

kiwi = require("kiwi");

Events = require("../events").Events;

Variable = kiwi.Variable, Expression = kiwi.Expression, Constraint = kiwi.Constraint, Operator = kiwi.Operator, Strength = kiwi.Strength;

_constrainer = function(op) {
  return (function(_this) {
    return function() {
      var expr;
      expr = Object.create(Expression.prototype);
      Expression.apply(expr, arguments);
      return new Constraint(expr, op);
    };
  })(this);
};

_weak_constrainer = function(op) {
  return function() {
    var arg, args, i, len;
    args = [null];
    for (i = 0, len = arguments.length; i < len; i++) {
      arg = arguments[i];
      args.push(arg);
    }
    return new Constraint(new (Function.prototype.bind.apply(Expression, args)), op, kiwi.Strength.weak);
  };
};

Solver = (function() {
  _.extend(Solver.prototype, Events);

  function Solver() {
    this.solver = new kiwi.Solver();
  }

  Solver.prototype.clear = function() {
    return this.solver = new kiwi.Solver();
  };

  Solver.prototype.toString = function() {
    return "Solver[num_constraints=" + (this.num_constraints()) + ", num_edit_variables=" + (this.num_edit_variables()) + "]";
  };

  Solver.prototype.num_constraints = function() {
    return this.solver._cnMap._array.length;
  };

  Solver.prototype.num_edit_variables = function() {
    return this.solver._editMap._array.length;
  };

  Solver.prototype.update_variables = function(trigger) {
    if (trigger == null) {
      trigger = true;
    }
    this.solver.updateVariables();
    if (trigger) {
      return this.trigger('layout_update');
    }
  };

  Solver.prototype.add_constraint = function(constraint) {
    return this.solver.addConstraint(constraint);
  };

  Solver.prototype.remove_constraint = function(constraint) {
    return this.solver.removeConstraint(constraint);
  };

  Solver.prototype.add_edit_variable = function(variable, strength) {
    return this.solver.addEditVariable(variable, strength);
  };

  Solver.prototype.remove_edit_variable = function(variable) {
    return this.solver.removeEditVariable(variable, strength);
  };

  Solver.prototype.suggest_value = function(variable, value) {
    return this.solver.suggestValue(variable, value);
  };

  return Solver;

})();

module.exports = {
  Variable: Variable,
  Expression: Expression,
  Constraint: Constraint,
  Operator: Operator,
  Strength: Strength,
  EQ: _constrainer(Operator.Eq),
  LE: _constrainer(Operator.Le),
  GE: _constrainer(Operator.Ge),
  WEAK_EQ: _weak_constrainer(Operator.Eq),
  WEAK_LE: _weak_constrainer(Operator.Le),
  WEAK_GE: _weak_constrainer(Operator.Ge),
  Solver: Solver
};
