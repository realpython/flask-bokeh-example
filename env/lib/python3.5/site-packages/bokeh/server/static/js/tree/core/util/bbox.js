var empty, union;

empty = function() {
  return {
    minX: 2e308,
    minY: 2e308,
    maxX: -2e308,
    maxY: -2e308
  };
};

union = function(a, b) {
  var r;
  r = {};
  r.minX = Math.min(a.minX, b.minX);
  r.maxX = Math.max(a.maxX, b.maxX);
  r.minY = Math.min(a.minY, b.minY);
  r.maxY = Math.max(a.maxY, b.maxY);
  return r;
};

module.exports = {
  empty: empty,
  union: union
};
