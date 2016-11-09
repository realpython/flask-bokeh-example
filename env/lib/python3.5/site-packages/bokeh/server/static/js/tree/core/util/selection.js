var get_indices;

get_indices = function(data_source) {
  var selected;
  selected = data_source.selected;
  if (selected['0d'].glyph) {
    return selected['0d'].indices;
  } else if (selected['1d'].indices.length > 0) {
    return selected['1d'].indices;
  } else if (selected['2d'].indices.length > 0) {
    return selected['2d'].indices;
  } else {
    return [];
  }
};

module.exports = {
  get_indices: get_indices
};
