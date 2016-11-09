var _delay_animation, delay_animation, throttle;

_delay_animation = function(f) {
  return f();
};

delay_animation = (typeof window !== "undefined" && window !== null ? window.requestAnimationFrame : void 0) || (typeof window !== "undefined" && window !== null ? window.mozRequestAnimationFrame : void 0) || (typeof window !== "undefined" && window !== null ? window.webkitRequestAnimationFrame : void 0) || (typeof window !== "undefined" && window !== null ? window.msRequestAnimationFrame : void 0) || _delay_animation;

throttle = function(func, wait) {
  var args, context, later, pending, previous, ref, result, timeout;
  ref = [null, null, null, null], context = ref[0], args = ref[1], timeout = ref[2], result = ref[3];
  previous = 0;
  pending = false;
  later = function() {
    previous = new Date;
    timeout = null;
    pending = false;
    return result = func.apply(context, args);
  };
  return function() {
    var now, remaining;
    now = new Date;
    remaining = wait - (now - previous);
    context = this;
    args = arguments;
    if (remaining <= 0 && !pending) {
      clearTimeout(timeout);
      pending = true;
      delay_animation(later);
    } else if (!timeout && !pending) {
      timeout = setTimeout((function() {
        return delay_animation(later);
      }), remaining);
    }
    return result;
  };
};

module.exports = {
  throttle: throttle
};
