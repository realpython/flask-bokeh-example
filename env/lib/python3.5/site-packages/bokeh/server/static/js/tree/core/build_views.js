var _, build_views, jQueryUIPrefixer;

_ = require("underscore");

build_views = function(view_storage, view_models, options, view_types) {
  var created_views, i, i_model, j, key, len, len1, model, newmodels, to_remove, view_specific_option;
  if (view_types == null) {
    view_types = [];
  }
  created_views = [];
  newmodels = _.filter(view_models, function(x) {
    return !_.has(view_storage, x.id);
  });
  for (i_model = i = 0, len = newmodels.length; i < len; i_model = ++i) {
    model = newmodels[i_model];
    view_specific_option = _.extend({}, options, {
      'model': model
    });
    if (i_model < view_types.length) {
      view_storage[model.id] = new view_types[i_model](view_specific_option);
    } else {
      view_storage[model.id] = new model.default_view(view_specific_option);
    }
    view_storage[model.id].$el.find("*[class*='ui-']").each(function(idx, el) {
      return el.className = jQueryUIPrefixer(el);
    });
    created_views.push(view_storage[model.id]);
  }
  to_remove = _.difference(_.keys(view_storage), _.pluck(view_models, 'id'));
  for (j = 0, len1 = to_remove.length; j < len1; j++) {
    key = to_remove[j];
    view_storage[key].remove();
    delete view_storage[key];
  }
  return created_views;
};

jQueryUIPrefixer = function(el) {
  var classList, prefixedClassList;
  if (el.className == null) {
    return;
  }
  classList = el.className.split(" ");
  prefixedClassList = _.map(classList, function(a) {
    a = a.trim();
    if (a.indexOf("ui-") === 0) {
      return "bk-" + a;
    } else {
      return a;
    }
  });
  return prefixedClassList.join(" ");
};

build_views.jQueryUIPrefixer = jQueryUIPrefixer;

module.exports = build_views = build_views;
