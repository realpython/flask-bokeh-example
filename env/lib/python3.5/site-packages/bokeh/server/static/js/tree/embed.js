var $, BOKEH_ROOT, Document, Promise, RootAddedEvent, RootRemovedEvent, TitleChangedEvent, _, _create_view, _get_session, _handle_notebook_comms, _init_comms, _render_document_to_element, _sessions, _update_comms_callback, add_document_from_session, add_document_standalone, add_document_static, add_model_from_session, add_model_static, base, embed_items, fill_render_item_from_script_tag, inject_css, inject_raw_css, logger, pull_session, ref, ref1, set_log_level;

$ = require("jquery");

_ = require("underscore");

Promise = require("es6-promise").Promise;

base = require("./base");

pull_session = require("./client").pull_session;

ref = require("./core/logging"), logger = ref.logger, set_log_level = ref.set_log_level;

ref1 = require("./document"), Document = ref1.Document, RootAddedEvent = ref1.RootAddedEvent, RootRemovedEvent = ref1.RootRemovedEvent, TitleChangedEvent = ref1.TitleChangedEvent;

BOKEH_ROOT = "bk-root";

_handle_notebook_comms = function(msg) {
  var data;
  logger.debug("handling notebook comms");
  data = JSON.parse(msg.content.data);
  if ('events' in data && 'references' in data) {
    return this.apply_json_patch(data);
  } else if ('doc' in data) {
    return this.replace_with_json(data['doc']);
  } else {
    throw new Error("handling notebook comms message: ", msg);
  }
};

_update_comms_callback = function(target, doc, comm) {
  if (target === comm.target_name) {
    return comm.on_msg(_.bind(_handle_notebook_comms, doc));
  }
};

_init_comms = function(target, doc) {
  var comm_manager, e, id, promise, ref2, update_comms;
  if ((typeof Jupyter !== "undefined" && Jupyter !== null) && (Jupyter.notebook.kernel != null)) {
    logger.info("Registering Jupyter comms for target " + target);
    comm_manager = Jupyter.notebook.kernel.comm_manager;
    update_comms = _.partial(_update_comms_callback, target, doc);
    ref2 = comm_manager.comms;
    for (id in ref2) {
      promise = ref2[id];
      promise.then(update_comms);
    }
    try {
      return comm_manager.register_target(target, function(comm, msg) {
        logger.info("Registering Jupyter comms for target " + target);
        return comm.on_msg(_.bind(_handle_notebook_comms, doc));
      });
    } catch (error1) {
      e = error1;
      return logger.warn("Jupyter comms failed to register. push_notebook() will not function. (exception reported: " + e + ")");
    }
  } else {
    return console.warn('Jupyter notebooks comms not available. push_notebook() will not function');
  }
};

_create_view = function(model) {
  var view;
  view = new model.default_view({
    model: model
  });
  base.index[model.id] = view;
  return view;
};

_render_document_to_element = function(element, document, use_for_title) {
  var i, len, model, ref2, render_model, unrender_model, views;
  views = {};
  render_model = function(model) {
    var view;
    view = _create_view(model);
    views[model.id] = view;
    return $(element).append(view.$el);
  };
  unrender_model = function(model) {
    var view;
    if (model.id in views) {
      view = views[model.id];
      $(element).remove(view.$el);
      delete views[model.id];
      return delete base.index[model.id];
    }
  };
  ref2 = document.roots();
  for (i = 0, len = ref2.length; i < len; i++) {
    model = ref2[i];
    render_model(model);
  }
  if (use_for_title) {
    window.document.title = document.title();
  }
  document.on_change(function(event) {
    if (event instanceof RootAddedEvent) {
      return render_model(event.model);
    } else if (event instanceof RootRemovedEvent) {
      return unrender_model(event.model);
    } else if (use_for_title && event instanceof TitleChangedEvent) {
      return window.document.title = event.title;
    }
  });
  return views;
};

add_model_static = function(element, model_id, doc) {
  var model, view;
  model = doc.get_model_by_id(model_id);
  if (model == null) {
    throw new Error("Model " + model_id + " was not in document " + doc);
  }
  view = _create_view(model);
  return _.delay(function() {
    return $(element).replaceWith(view.$el);
  });
};

add_document_static = function(element, doc, use_for_title) {
  return _.delay(function() {
    return _render_document_to_element($(element), doc, use_for_title);
  });
};

add_document_standalone = function(document, element, use_for_title) {
  if (use_for_title == null) {
    use_for_title = false;
  }
  return _render_document_to_element($(element), document, use_for_title);
};

_sessions = {};

_get_session = function(websocket_url, session_id) {
  var subsessions;
  if ((websocket_url == null) || websocket_url === null) {
    throw new Error("Missing websocket_url");
  }
  if (!(websocket_url in _sessions)) {
    _sessions[websocket_url] = {};
  }
  subsessions = _sessions[websocket_url];
  if (!(session_id in subsessions)) {
    subsessions[session_id] = pull_session(websocket_url, session_id);
  }
  return subsessions[session_id];
};

add_document_from_session = function(element, websocket_url, session_id, use_for_title) {
  var promise;
  promise = _get_session(websocket_url, session_id);
  return promise.then(function(session) {
    return _render_document_to_element(element, session.document, use_for_title);
  }, function(error) {
    logger.error("Failed to load Bokeh session " + session_id + ": " + error);
    throw error;
  });
};

add_model_from_session = function(element, websocket_url, model_id, session_id) {
  var promise;
  promise = _get_session(websocket_url, session_id);
  return promise.then(function(session) {
    var model, view;
    model = session.document.get_model_by_id(model_id);
    if (model == null) {
      throw new Error("Did not find model " + model_id + " in session");
    }
    view = _create_view(model);
    return $(element).replaceWith(view.$el);
  }, function(error) {
    logger.error("Failed to load Bokeh session " + session_id + ": " + error);
    throw error;
  });
};

inject_css = function(url) {
  var link;
  link = $("<link href='" + url + "' rel='stylesheet' type='text/css'>");
  return $('body').append(link);
};

inject_raw_css = function(css) {
  var style;
  style = $("<style>").html(css);
  return $('body').append(style);
};

fill_render_item_from_script_tag = function(script, item) {
  var info;
  info = script.data();
  if ((info.bokehLogLevel != null) && info.bokehLogLevel.length > 0) {
    set_log_level(info.bokehLogLevel);
  }
  if ((info.bokehDocId != null) && info.bokehDocId.length > 0) {
    item['docid'] = info.bokehDocId;
  }
  if ((info.bokehModelId != null) && info.bokehModelId.length > 0) {
    item['modelid'] = info.bokehModelId;
  }
  if ((info.bokehSessionId != null) && info.bokehSessionId.length > 0) {
    item['sessionid'] = info.bokehSessionId;
  }
  return logger.info("Will inject Bokeh script tag with params " + (JSON.stringify(item)));
};

embed_items = function(docs_json, render_items, websocket_url) {
  var child, container, docid, docs, elem, element_id, i, item, len, promise, results, use_for_title;
  if (websocket_url == null) {
    websocket_url = null;
  }
  docs = {};
  for (docid in docs_json) {
    docs[docid] = Document.from_json(docs_json[docid]);
  }
  results = [];
  for (i = 0, len = render_items.length; i < len; i++) {
    item = render_items[i];
    if (item.notebook_comms_target != null) {
      _init_comms(item.notebook_comms_target, docs[docid]);
    }
    element_id = item['elementid'];
    elem = $('#' + element_id);
    if (elem.length === 0) {
      throw new Error("Error rendering Bokeh model: could not find tag with id: " + element_id);
    }
    if (elem.length > 1) {
      throw new Error("Error rendering Bokeh model: found too many tags with id: " + element_id);
    }
    if (!document.body.contains(elem[0])) {
      throw new Error("Error rendering Bokeh model: element with id '" + element_id + "' must be under <body>");
    }
    if (elem.prop("tagName") === "SCRIPT") {
      fill_render_item_from_script_tag(elem, item);
      container = $('<div>', {
        "class": BOKEH_ROOT
      });
      elem.replaceWith(container);
      child = $('<div>');
      container.append(child);
      elem = child;
    }
    use_for_title = (item.use_for_title != null) && item.use_for_title;
    promise = null;
    if (item.modelid != null) {
      if (item.docid != null) {
        add_model_static(elem, item.modelid, docs[item.docid]);
      } else if (item.sessionid != null) {
        promise = add_model_from_session(elem, websocket_url, item.modelid, item.sessionid);
      } else {
        throw new Error("Error rendering Bokeh model " + item['modelid'] + " to element " + element_id + ": no document ID or session ID specified");
      }
    } else {
      if (item.docid != null) {
        add_document_static(elem, docs[item.docid], use_for_title);
      } else if (item.sessionid != null) {
        promise = add_document_from_session(elem, websocket_url, item.sessionid, use_for_title);
      } else {
        throw new Error("Error rendering Bokeh document to element " + element_id + ": no document ID or session ID specified");
      }
    }
    if (promise !== null) {
      results.push(promise.then(function(value) {
        return console.log("Bokeh items were rendered successfully");
      }, function(error) {
        return console.log("Error rendering Bokeh items ", error);
      }));
    } else {
      results.push(void 0);
    }
  }
  return results;
};

module.exports = {
  embed_items: embed_items,
  add_document_static: add_document_static,
  add_document_standalone: add_document_standalone,
  inject_css: inject_css,
  inject_raw_css: inject_raw_css,
  BOKEH_ROOT: BOKEH_ROOT
};
