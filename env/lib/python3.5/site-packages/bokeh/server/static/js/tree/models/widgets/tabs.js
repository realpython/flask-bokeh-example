var $, $1, Tabs, TabsView, Widget, _, p, tabs_template,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

$ = require("jquery");

$1 = require("bootstrap/tab");

p = require("../../core/properties");

tabs_template = require("./tabs_template");

Widget = require("./widget");

TabsView = (function(superClass) {
  extend(TabsView, superClass);

  function TabsView() {
    return TabsView.__super__.constructor.apply(this, arguments);
  }

  TabsView.prototype.render = function() {
    var $panels, active, child, children, html, j, key, len, panel, ref, ref1, ref2, tabs, that, val;
    TabsView.__super__.render.call(this);
    ref = this.child_views;
    for (key in ref) {
      if (!hasProp.call(ref, key)) continue;
      val = ref[key];
      val.$el.detach();
    }
    this.$el.empty();
    tabs = this.model.tabs;
    active = this.model.active;
    children = this.model.children;
    html = $(tabs_template({
      tabs: tabs,
      active: function(i) {
        if (i === active) {
          return 'bk-bs-active';
        } else {
          return '';
        }
      }
    }));
    that = this;
    html.find("> li > a").click(function(event) {
      var panelId, panelIdx, ref1;
      event.preventDefault();
      $(this).tab('show');
      panelId = $(this).attr('href').replace('#tab-', '');
      tabs = that.model.tabs;
      panelIdx = _.indexOf(tabs, _.find(tabs, function(panel) {
        return panel.id === panelId;
      }));
      that.model.active = panelIdx;
      return (ref1 = that.model.callback) != null ? ref1.execute(that.model) : void 0;
    });
    $panels = html.children(".bk-bs-tab-pane");
    ref1 = _.zip(children, $panels);
    for (j = 0, len = ref1.length; j < len; j++) {
      ref2 = ref1[j], child = ref2[0], panel = ref2[1];
      $(panel).html(this.child_views[child.id].$el);
    }
    this.$el.append(html);
    this.$el.tabs;
    return this;
  };

  return TabsView;

})(Widget.View);

Tabs = (function(superClass) {
  extend(Tabs, superClass);

  function Tabs() {
    return Tabs.__super__.constructor.apply(this, arguments);
  }

  Tabs.prototype.type = "Tabs";

  Tabs.prototype.default_view = TabsView;

  Tabs.prototype.initialize = function(options) {
    var tab;
    Tabs.__super__.initialize.call(this, options);
    return this.children = (function() {
      var j, len, ref, results;
      ref = this.tabs;
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        tab = ref[j];
        results.push(tab.child);
      }
      return results;
    }).call(this);
  };

  Tabs.define({
    tabs: [p.Array, []],
    active: [p.Number, 0],
    callback: [p.Instance]
  });

  Tabs.internal({
    children: [p.Array, []]
  });

  Tabs.prototype.get_layoutable_children = function() {
    return this.children;
  };

  Tabs.prototype.get_edit_variables = function() {
    var child, edit_variables, j, len, ref;
    edit_variables = Tabs.__super__.get_edit_variables.call(this);
    ref = this.get_layoutable_children();
    for (j = 0, len = ref.length; j < len; j++) {
      child = ref[j];
      edit_variables = edit_variables.concat(child.get_edit_variables());
    }
    return edit_variables;
  };

  Tabs.prototype.get_constraints = function() {
    var child, constraints, j, len, ref;
    constraints = Tabs.__super__.get_constraints.call(this);
    ref = this.get_layoutable_children();
    for (j = 0, len = ref.length; j < len; j++) {
      child = ref[j];
      constraints = constraints.concat(child.get_constraints());
    }
    return constraints;
  };

  return Tabs;

})(Widget.Model);

module.exports = {
  Model: Tabs,
  View: TabsView
};
