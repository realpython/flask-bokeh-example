var _burst_into_flames, safely;

_burst_into_flames = function(error) {
  var body, box, button, message, ref, title;
  box = document.createElement("div");
  box.style["background-color"] = "#f2dede";
  box.style["border"] = "1px solid #a94442";
  box.style["border-radius"] = "4px";
  box.style["display"] = "inline-block";
  box.style["font-family"] = "sans-serif";
  box.style["margin-top"] = "5px";
  box.style["min-width"] = "200px";
  box.style["padding"] = "5px 5px 5px 10px";
  button = document.createElement("span");
  button.style["background-color"] = "#a94442";
  button.style["border-radius"] = "0px 4px 0px 0px";
  button.style["color"] = "white";
  button.style["cursor"] = "pointer";
  button.style["float"] = "right";
  button.style["font-size"] = "0.8em";
  button.style["margin"] = "-6px -6px 0px 0px";
  button.style["padding"] = "2px 5px 4px 5px";
  button.title = "close";
  button.setAttribute("aria-label", "close");
  button.appendChild(document.createTextNode("x"));
  button.addEventListener("click", function() {
    return body.removeChild(box);
  });
  title = document.createElement("h3");
  title.style["color"] = "#a94442";
  title.style["margin"] = "8px 0px 0px 0px";
  title.style["padding"] = "0px";
  title.appendChild(document.createTextNode("Bokeh Error"));
  message = document.createElement("pre");
  message.style["white-space"] = "unset";
  message.appendChild(document.createTextNode((ref = error.message) != null ? ref : error));
  box.appendChild(button);
  box.appendChild(title);
  box.appendChild(message);
  body = document.getElementsByTagName("body")[0];
  return body.insertBefore(box, body.firstChild);
};

safely = function(fn, silent) {
  var error;
  if (silent == null) {
    silent = false;
  }
  try {
    return fn();
  } catch (error1) {
    error = error1;
    _burst_into_flames(error);
    if (!silent) {
      throw error;
    }
  }
};

module.exports = safely;
