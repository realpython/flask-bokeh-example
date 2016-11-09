var Annotation, ArrowHead, NormalHead, OpenHead, Renderer, VeeHead, Visuals, p,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Annotation = require("./annotation");

Renderer = require("../renderers/renderer");

Visuals = require("../../core/visuals").Visuals;

p = require("../../core/properties");

ArrowHead = (function(superClass) {
  extend(ArrowHead, superClass);

  function ArrowHead() {
    return ArrowHead.__super__.constructor.apply(this, arguments);
  }

  ArrowHead.prototype.type = 'ArrowHead';

  ArrowHead.prototype.initialize = function(options) {
    ArrowHead.__super__.initialize.call(this, options);
    return this.visuals = new Visuals(this);
  };

  ArrowHead.prototype.render = function(ctx, i) {
    return null;
  };

  return ArrowHead;

})(Annotation.Model);

OpenHead = (function(superClass) {
  extend(OpenHead, superClass);

  function OpenHead() {
    return OpenHead.__super__.constructor.apply(this, arguments);
  }

  OpenHead.prototype.type = 'OpenHead';

  OpenHead.prototype.render = function(ctx, i) {
    if (this.visuals.line.doit) {
      this.visuals.line.set_vectorize(ctx, i);
      ctx.beginPath();
      ctx.moveTo(0.5 * this.size, this.size);
      ctx.lineTo(0, 0);
      ctx.lineTo(-0.5 * this.size, this.size);
      return ctx.stroke();
    }
  };

  OpenHead.mixins(['line']);

  OpenHead.define({
    size: [p.Number, 25]
  });

  return OpenHead;

})(ArrowHead);

NormalHead = (function(superClass) {
  extend(NormalHead, superClass);

  function NormalHead() {
    return NormalHead.__super__.constructor.apply(this, arguments);
  }

  NormalHead.prototype.type = 'NormalHead';

  NormalHead.prototype.render = function(ctx, i) {
    if (this.visuals.fill.doit) {
      this.visuals.fill.set_vectorize(ctx, i);
      ctx.beginPath();
      ctx.moveTo(0.5 * this.size, this.size);
      ctx.lineTo(0, 0);
      ctx.lineTo(-0.5 * this.size, this.size);
      ctx.closePath();
      ctx.fill();
    }
    if (this.visuals.line.doit) {
      this.visuals.line.set_vectorize(ctx, i);
      ctx.beginPath();
      ctx.moveTo(0.5 * this.size, this.size);
      ctx.lineTo(0, 0);
      ctx.lineTo(-0.5 * this.size, this.size);
      ctx.closePath();
      return ctx.stroke();
    }
  };

  NormalHead.mixins(['line', 'fill']);

  NormalHead.define({
    size: [p.Number, 25]
  });

  NormalHead.override({
    fill_color: 'black'
  });

  return NormalHead;

})(ArrowHead);

VeeHead = (function(superClass) {
  extend(VeeHead, superClass);

  function VeeHead() {
    return VeeHead.__super__.constructor.apply(this, arguments);
  }

  VeeHead.prototype.type = 'VeeHead';

  VeeHead.prototype.render = function(ctx, i) {
    if (this.visuals.fill.doit) {
      this.visuals.fill.set_vectorize(ctx, i);
      ctx.beginPath();
      ctx.moveTo(0.5 * this.size, this.size);
      ctx.lineTo(0, 0);
      ctx.lineTo(-0.5 * this.size, this.size);
      ctx.lineTo(0, 0.5 * this.size);
      ctx.closePath();
      ctx.fill();
    }
    if (this.visuals.line.doit) {
      this.visuals.line.set_vectorize(ctx, i);
      ctx.beginPath();
      ctx.moveTo(0.5 * this.size, this.size);
      ctx.lineTo(0, 0);
      ctx.lineTo(-0.5 * this.size, this.size);
      ctx.lineTo(0, 0.5 * this.size);
      ctx.closePath();
      return ctx.stroke();
    }
  };

  VeeHead.mixins(['line', 'fill']);

  VeeHead.define({
    size: [p.Number, 25]
  });

  VeeHead.override({
    fill_color: 'black'
  });

  return VeeHead;

})(ArrowHead);

module.exports = {
  OpenHead: {
    Model: OpenHead
  },
  NormalHead: {
    Model: NormalHead
  },
  VeeHead: {
    Model: VeeHead
  }
};
