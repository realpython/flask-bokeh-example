var _;

_ = require("underscore");

module.exports = {
  LinAlg: require("./api/linalg"),
  Charts: require("./api/charts"),
  Plotting: require("./api/plotting"),
  Document: require("./document").Document,
  sprintf: require("sprintf")
};

_.extend(module.exports, require("./api/models"));
