var ClientConnection, ClientSession, DEFAULT_SERVER_WEBSOCKET_URL, DEFAULT_SESSION_ID, Document, HasProps, Message, ModelChangedEvent, Promise, RootAddedEvent, RootRemovedEvent, _, logger, message_handlers, pull_session, ref;

_ = require("underscore");

Promise = require("es6-promise").Promise;

HasProps = require("./core/has_props");

logger = require("./core/logging").logger;

ref = require("./document"), Document = ref.Document, ModelChangedEvent = ref.ModelChangedEvent, RootAddedEvent = ref.RootAddedEvent, RootRemovedEvent = ref.RootRemovedEvent;

DEFAULT_SERVER_WEBSOCKET_URL = "ws://localhost:5006/ws";

DEFAULT_SESSION_ID = "default";

Message = (function() {
  function Message(header1, metadata1, content1) {
    this.header = header1;
    this.metadata = metadata1;
    this.content = content1;
    this.buffers = [];
  }

  Message.assemble = function(header_json, metadata_json, content_json) {
    var content, e, header, metadata;
    try {
      header = JSON.parse(header_json);
      metadata = JSON.parse(metadata_json);
      content = JSON.parse(content_json);
      return new Message(header, metadata, content);
    } catch (error1) {
      e = error1;
      logger.error("Failure parsing json " + e + " " + header_json + " " + metadata_json + " " + content_json, e);
      throw e;
    }
  };

  Message.create_header = function(msgtype, options) {
    var header;
    header = {
      'msgid': _.uniqueId(),
      'msgtype': msgtype
    };
    return _.extend(header, options);
  };

  Message.create = function(msgtype, header_options, content) {
    var header;
    if (content == null) {
      content = {};
    }
    header = Message.create_header(msgtype, header_options);
    return new Message(header, {}, content);
  };

  Message.prototype.send = function(socket) {
    var content_json, e, header_json, metadata_json;
    try {
      header_json = JSON.stringify(this.header);
      metadata_json = JSON.stringify(this.metadata);
      content_json = JSON.stringify(this.content);
      socket.send(header_json);
      socket.send(metadata_json);
      return socket.send(content_json);
    } catch (error1) {
      e = error1;
      logger.error("Error sending ", this, e);
      throw e;
    }
  };

  Message.prototype.complete = function() {
    if ((this.header != null) && (this.metadata != null) && (this.content != null)) {
      if ('num_buffers' in this.header) {
        return this.buffers.length === this.header['num_buffers'];
      } else {
        return true;
      }
    } else {
      return false;
    }
  };

  Message.prototype.add_buffer = function(buffer) {
    return this.buffers.push(buffer);
  };

  Message.prototype._header_field = function(field) {
    if (field in this.header) {
      return this.header[field];
    } else {
      return null;
    }
  };

  Message.prototype.msgid = function() {
    return this._header_field('msgid');
  };

  Message.prototype.msgtype = function() {
    return this._header_field('msgtype');
  };

  Message.prototype.sessid = function() {
    return this._header_field('sessid');
  };

  Message.prototype.reqid = function() {
    return this._header_field('reqid');
  };

  Message.prototype.problem = function() {
    if (!('msgid' in this.header)) {
      return "No msgid in header";
    } else if (!('msgtype' in this.header)) {
      return "No msgtype in header";
    } else {
      return null;
    }
  };

  return Message;

})();

message_handlers = {
  'PATCH-DOC': function(connection, message) {
    return connection._for_session(function(session) {
      return session._handle_patch(message);
    });
  },
  'OK': function(connection, message) {
    return logger.debug("Unhandled OK reply to " + (message.reqid()));
  },
  'ERROR': function(connection, message) {
    return logger.error("Unhandled ERROR reply to " + (message.reqid()) + ": " + message.content['text']);
  }
};

ClientConnection = (function() {
  ClientConnection._connection_count = 0;

  function ClientConnection(url1, id, _on_have_session_hook, _on_closed_permanently_hook) {
    this.url = url1;
    this.id = id;
    this._on_have_session_hook = _on_have_session_hook;
    this._on_closed_permanently_hook = _on_closed_permanently_hook;
    this._number = ClientConnection._connection_count;
    ClientConnection._connection_count = this._number + 1;
    if (this.url == null) {
      this.url = DEFAULT_SERVER_WEBSOCKET_URL;
    }
    if (this.id == null) {
      this.id = DEFAULT_SESSION_ID;
    }
    logger.debug("Creating websocket " + this._number + " to '" + this.url + "' session '" + this.id + "'");
    this.socket = null;
    this.closed_permanently = false;
    this._fragments = [];
    this._partial = null;
    this._current_handler = null;
    this._pending_ack = null;
    this._pending_replies = {};
    this.session = null;
  }

  ClientConnection.prototype._for_session = function(f) {
    if (this.session !== null) {
      return f(this.session);
    }
  };

  ClientConnection.prototype.connect = function() {
    var error, versioned_url;
    if (this.closed_permanently) {
      return Promise.reject(new Error("Cannot connect() a closed ClientConnection"));
    }
    if (this.socket != null) {
      return Promise.reject(new Error("Already connected"));
    }
    this._fragments = [];
    this._partial = null;
    this._pending_replies = {};
    this._current_handler = null;
    try {
      versioned_url = this.url + "?bokeh-protocol-version=1.0&bokeh-session-id=" + this.id;
      if (window.MozWebSocket != null) {
        this.socket = new MozWebSocket(versioned_url);
      } else {
        this.socket = new WebSocket(versioned_url);
      }
      return new Promise((function(_this) {
        return function(resolve, reject) {
          _this.socket.binarytype = "arraybuffer";
          _this.socket.onopen = function() {
            return _this._on_open(resolve, reject);
          };
          _this.socket.onmessage = function(event) {
            return _this._on_message(event);
          };
          _this.socket.onclose = function(event) {
            return _this._on_close(event);
          };
          return _this.socket.onerror = function() {
            return _this._on_error(reject);
          };
        };
      })(this));
    } catch (error1) {
      error = error1;
      logger.error("websocket creation failed to url: " + this.url);
      logger.error(" - " + error);
      return Promise.reject(error);
    }
  };

  ClientConnection.prototype.close = function() {
    if (!this.closed_permanently) {
      logger.debug("Permanently closing websocket connection " + this._number);
      this.closed_permanently = true;
      if (this.socket != null) {
        this.socket.close(1000, "close method called on ClientConnection " + this._number);
      }
      this._for_session(function(session) {
        return session._connection_closed();
      });
      if (this._on_closed_permanently_hook != null) {
        this._on_closed_permanently_hook();
        return this._on_closed_permanently_hook = null;
      }
    }
  };

  ClientConnection.prototype._schedule_reconnect = function(milliseconds) {
    var retry;
    retry = (function(_this) {
      return function() {
        if (true || _this.closed_permanently) {
          if (!_this.closed_permanently) {
            logger.info("Websocket connection " + _this._number + " disconnected, will not attempt to reconnect");
          }
        } else {
          logger.debug("Attempting to reconnect websocket " + _this._number);
          return _this.connect();
        }
      };
    })(this);
    return setTimeout(retry, milliseconds);
  };

  ClientConnection.prototype.send = function(message) {
    var e;
    try {
      if (this.socket === null) {
        throw new Error("not connected so cannot send " + message);
      }
      return message.send(this.socket);
    } catch (error1) {
      e = error1;
      return logger.error("Error sending message ", e, message);
    }
  };

  ClientConnection.prototype.send_with_reply = function(message) {
    var promise;
    promise = new Promise((function(_this) {
      return function(resolve, reject) {
        _this._pending_replies[message.msgid()] = [resolve, reject];
        return _this.send(message);
      };
    })(this));
    return promise.then(function(message) {
      if (message.msgtype() === 'ERROR') {
        throw new Error("Error reply " + message.content['text']);
      } else {
        return message;
      }
    }, function(error) {
      throw error;
    });
  };

  ClientConnection.prototype._pull_doc_json = function() {
    var message, promise;
    message = Message.create('PULL-DOC-REQ', {});
    promise = this.send_with_reply(message);
    return promise.then(function(reply) {
      if (!('doc' in reply.content)) {
        throw new Error("No 'doc' field in PULL-DOC-REPLY");
      }
      return reply.content['doc'];
    }, function(error) {
      throw error;
    });
  };

  ClientConnection.prototype._repull_session_doc = function() {
    if (this.session === null) {
      logger.debug("Pulling session for first time");
    } else {
      logger.debug("Repulling session");
    }
    return this._pull_doc_json().then((function(_this) {
      return function(doc_json) {
        var document, patch, patch_message;
        if (_this.session === null) {
          if (_this.closed_permanently) {
            return logger.debug("Got new document after connection was already closed");
          } else {
            document = Document.from_json(doc_json);
            patch = Document._compute_patch_since_json(doc_json, document);
            if (patch.events.length > 0) {
              logger.debug("Sending " + patch.events.length + " changes from model construction back to server");
              patch_message = Message.create('PATCH-DOC', {}, patch);
              _this.send(patch_message);
            }
            _this.session = new ClientSession(_this, document, _this.id);
            logger.debug("Created a new session from new pulled doc");
            if (_this._on_have_session_hook != null) {
              _this._on_have_session_hook(_this.session);
              return _this._on_have_session_hook = null;
            }
          }
        } else {
          _this.session.document.replace_with_json(doc_json);
          return logger.debug("Updated existing session with new pulled doc");
        }
      };
    })(this), function(error) {
      throw error;
    })["catch"](function(error) {
      if (console.trace != null) {
        console.trace(error);
      }
      return logger.error("Failed to repull session " + error);
    });
  };

  ClientConnection.prototype._on_open = function(resolve, reject) {
    logger.info("Websocket connection " + this._number + " is now open");
    this._pending_ack = [resolve, reject];
    return this._current_handler = (function(_this) {
      return function(message) {
        return _this._awaiting_ack_handler(message);
      };
    })(this);
  };

  ClientConnection.prototype._on_message = function(event) {
    var e;
    try {
      return this._on_message_unchecked(event);
    } catch (error1) {
      e = error1;
      return logger.error("Error handling message: " + e + ", " + event);
    }
  };

  ClientConnection.prototype._on_message_unchecked = function(event) {
    var msg, problem;
    if (this._current_handler == null) {
      logger.error("got a message but haven't set _current_handler");
    }
    if (event.data instanceof ArrayBuffer) {
      if ((this._partial != null) && !this._partial.complete()) {
        this._partial.add_buffer(event.data);
      } else {
        this._close_bad_protocol("Got binary from websocket but we were expecting text");
      }
    } else if (this._partial != null) {
      this._close_bad_protocol("Got text from websocket but we were expecting binary");
    } else {
      this._fragments.push(event.data);
      if (this._fragments.length === 3) {
        this._partial = Message.assemble(this._fragments[0], this._fragments[1], this._fragments[2]);
        this._fragments = [];
        problem = this._partial.problem();
        if (problem !== null) {
          this._close_bad_protocol(problem);
        }
      }
    }
    if ((this._partial != null) && this._partial.complete()) {
      msg = this._partial;
      this._partial = null;
      return this._current_handler(msg);
    }
  };

  ClientConnection.prototype._on_close = function(event) {
    var pop_pending, promise_funcs;
    logger.info("Lost websocket " + this._number + " connection, " + event.code + " (" + event.reason + ")");
    this.socket = null;
    if (this._pending_ack != null) {
      this._pending_ack[1](new Error("Lost websocket connection, " + event.code + " (" + event.reason + ")"));
      this._pending_ack = null;
    }
    pop_pending = function() {
      var promise_funcs, ref1, reqid;
      ref1 = this._pending_replies;
      for (reqid in ref1) {
        promise_funcs = ref1[reqid];
        delete this._pending_replies[reqid];
        return promise_funcs;
      }
      return null;
    };
    promise_funcs = pop_pending();
    while (promise_funcs !== null) {
      promise_funcs[1]("Disconnected");
      promise_funcs = pop_pending();
    }
    if (!this.closed_permanently) {
      return this._schedule_reconnect(2000);
    }
  };

  ClientConnection.prototype._on_error = function(reject) {
    logger.debug("Websocket error on socket  " + this._number);
    return reject(new Error("Could not open websocket"));
  };

  ClientConnection.prototype._close_bad_protocol = function(detail) {
    logger.error("Closing connection: " + detail);
    if (this.socket != null) {
      return this.socket.close(1002, detail);
    }
  };

  ClientConnection.prototype._awaiting_ack_handler = function(message) {
    if (message.msgtype() === "ACK") {
      this._current_handler = (function(_this) {
        return function(message) {
          return _this._steady_state_handler(message);
        };
      })(this);
      this._repull_session_doc();
      if (this._pending_ack != null) {
        this._pending_ack[0](this);
        return this._pending_ack = null;
      }
    } else {
      return this._close_bad_protocol("First message was not an ACK");
    }
  };

  ClientConnection.prototype._steady_state_handler = function(message) {
    var promise_funcs;
    if (message.reqid() in this._pending_replies) {
      promise_funcs = this._pending_replies[message.reqid()];
      delete this._pending_replies[message.reqid()];
      return promise_funcs[0](message);
    } else if (message.msgtype() in message_handlers) {
      return message_handlers[message.msgtype()](this, message);
    } else {
      return logger.debug("Doing nothing with message " + (message.msgtype()));
    }
  };

  return ClientConnection;

})();

ClientSession = (function() {
  function ClientSession(_connection, document1, id) {
    this._connection = _connection;
    this.document = document1;
    this.id = id;
    this._current_patch = null;
    this.document_listener = (function(_this) {
      return function(event) {
        return _this._document_changed(event);
      };
    })(this);
    this.document.on_change(this.document_listener);
  }

  ClientSession.prototype.close = function() {
    return this._connection.close();
  };

  ClientSession.prototype._connection_closed = function() {
    return this.document.remove_on_change(this.document_listener);
  };

  ClientSession.prototype.request_server_info = function() {
    var message, promise;
    message = Message.create('SERVER-INFO-REQ', {});
    promise = this._connection.send_with_reply(message);
    return promise.then(function(reply) {
      return reply.content;
    });
  };

  ClientSession.prototype.force_roundtrip = function() {
    return this.request_server_info().then(function(ignored) {
      return void 0;
    });
  };

  ClientSession.prototype._should_suppress_on_change = function(patch, event) {
    var event_json, i, j, k, l, len, len1, len2, len3, patch_new, ref1, ref2, ref3, ref4;
    if (event instanceof ModelChangedEvent) {
      ref1 = patch.content['events'];
      for (i = 0, len = ref1.length; i < len; i++) {
        event_json = ref1[i];
        if (event_json['kind'] === 'ModelChanged' && event_json['model']['id'] === event.model.id && event_json['attr'] === event.attr) {
          patch_new = event_json['new'];
          if (event.new_ instanceof HasProps) {
            if (typeof patch_new === 'object' && 'id' in patch_new && patch_new['id'] === event.new_.id) {
              return true;
            }
          } else if (_.isEqual(patch_new, event.new_)) {
            return true;
          }
        }
      }
    } else if (event instanceof RootAddedEvent) {
      ref2 = patch.content['events'];
      for (j = 0, len1 = ref2.length; j < len1; j++) {
        event_json = ref2[j];
        if (event_json['kind'] === 'RootAdded' && event_json['model']['id'] === event.model.id) {
          return true;
        }
      }
    } else if (event instanceof RootRemovedEvent) {
      ref3 = patch.content['events'];
      for (k = 0, len2 = ref3.length; k < len2; k++) {
        event_json = ref3[k];
        if (event_json['kind'] === 'RootRemoved' && event_json['model']['id'] === event.model.id) {
          return true;
        }
      }
    } else if (event instanceof TitleChangedEvent) {
      ref4 = patch.content['events'];
      for (l = 0, len3 = ref4.length; l < len3; l++) {
        event_json = ref4[l];
        if (event_json['kind'] === 'TitleChanged' && event_json['title'] === event.title) {
          return true;
        }
      }
    }
    return false;
  };

  ClientSession.prototype._document_changed = function(event) {
    var patch;
    if ((this._current_patch != null) && this._should_suppress_on_change(this._current_patch, event)) {
      return;
    }
    if (event instanceof ModelChangedEvent && !(event.attr in event.model.serializable_attributes())) {
      return;
    }
    patch = Message.create('PATCH-DOC', {}, this.document.create_json_patch([event]));
    return this._connection.send(patch);
  };

  ClientSession.prototype._handle_patch = function(message) {
    this._current_patch = message;
    try {
      return this.document.apply_json_patch(message.content);
    } finally {
      this._current_patch = null;
    }
  };

  return ClientSession;

})();

pull_session = function(url, session_id) {
  var connection, promise, rejecter;
  rejecter = null;
  connection = null;
  promise = new Promise(function(resolve, reject) {
    connection = new ClientConnection(url, session_id, function(session) {
      var e;
      try {
        return resolve(session);
      } catch (error1) {
        e = error1;
        logger.error("Promise handler threw an error, closing session " + error);
        session.close();
        throw e;
      }
    }, function() {
      return reject(new Error("Connection was closed before we successfully pulled a session"));
    });
    return connection.connect().then(function(whatever) {}, function(error) {
      logger.error("Failed to connect to Bokeh server " + error);
      throw error;
    });
  });
  promise.close = function() {
    return connection.close();
  };
  return promise;
};

module.exports = {
  pull_session: pull_session,
  DEFAULT_SERVER_WEBSOCKET_URL: DEFAULT_SERVER_WEBSOCKET_URL,
  DEFAULT_SESSION_ID: DEFAULT_SESSION_ID
};
