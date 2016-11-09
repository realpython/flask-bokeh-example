var ImagePool;

ImagePool = (function() {
  function ImagePool() {
    this.images = [];
  }

  ImagePool.prototype.pop = function() {
    var img;
    img = this.images.pop();
    if (img != null) {
      return img;
    } else {
      return new Image();
    }
  };

  ImagePool.prototype.push = function(img) {
    if (this.images.length > 50) {
      return;
    }
    if (img.constructor === Array) {
      return Array.prototype.push.apply(this.images, img);
    } else {
      return this.images.push(img);
    }
  };

  return ImagePool;

})();

module.exports = ImagePool;
