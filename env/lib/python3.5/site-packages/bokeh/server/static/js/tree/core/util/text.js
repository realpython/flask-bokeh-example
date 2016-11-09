var $, cache, get_text_height;

$ = require("jquery");

cache = {};

get_text_height = function(font) {
  var block, body, div, result, text;
  if (cache[font] != null) {
    return cache[font];
  }
  text = $('<span>Hg</span>').css({
    font: font
  });
  block = $('<div style="display: inline-block; width: 1px; height: 0px;"> </div>');
  div = $('<div></div>');
  div.append(text, block);
  body = $('body');
  body.append(div);
  try {
    result = {};
    block.css({
      verticalAlign: 'baseline'
    });
    result.ascent = block.offset().top - text.offset().top;
    block.css({
      verticalAlign: 'bottom'
    });
    result.height = block.offset().top - text.offset().top;
    result.descent = result.height - result.ascent;
  } finally {
    div.remove();
  }
  cache[font] = result;
  return result;
};

module.exports = {
  get_text_height: get_text_height
};
