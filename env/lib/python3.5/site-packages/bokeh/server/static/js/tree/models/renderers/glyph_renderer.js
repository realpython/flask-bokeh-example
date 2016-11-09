var GlyphRenderer, GlyphRendererView, RemoteDataSource, Renderer, _, logger, p,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

Renderer = require("./renderer");

RemoteDataSource = require("../sources/remote_data_source");

logger = require("../../core/logging").logger;

p = require("../../core/properties");

GlyphRendererView = (function(superClass) {
  extend(GlyphRendererView, superClass);

  function GlyphRendererView() {
    return GlyphRendererView.__super__.constructor.apply(this, arguments);
  }

  GlyphRendererView.prototype.initialize = function(options) {
    var base_glyph, decimated_glyph, glyph_attrs, has_fill, has_line, hover_glyph, mk_glyph, nonselection_glyph, selection_glyph;
    GlyphRendererView.__super__.initialize.call(this, options);
    base_glyph = this.model.glyph;
    has_fill = _.contains(base_glyph.mixins, "fill");
    has_line = _.contains(base_glyph.mixins, "line");
    glyph_attrs = _.omit(_.clone(base_glyph.attributes), 'id');
    mk_glyph = function(defaults) {
      var attrs;
      attrs = _.clone(glyph_attrs);
      if (has_fill) {
        _.extend(attrs, defaults.fill);
      }
      if (has_line) {
        _.extend(attrs, defaults.line);
      }
      return new base_glyph.constructor(attrs);
    };
    this.glyph = this.build_glyph_view(base_glyph);
    selection_glyph = this.model.selection_glyph;
    if (selection_glyph == null) {
      selection_glyph = mk_glyph(this.model.selection_defaults);
    }
    this.selection_glyph = this.build_glyph_view(selection_glyph);
    nonselection_glyph = this.model.nonselection_glyph;
    if (nonselection_glyph == null) {
      nonselection_glyph = mk_glyph(this.model.nonselection_defaults);
    }
    this.nonselection_glyph = this.build_glyph_view(nonselection_glyph);
    hover_glyph = this.model.hover_glyph;
    if (hover_glyph != null) {
      this.hover_glyph = this.build_glyph_view(hover_glyph);
    }
    decimated_glyph = mk_glyph(this.model.decimated_defaults);
    this.decimated_glyph = this.build_glyph_view(decimated_glyph);
    this.xmapper = this.plot_view.frame.x_mappers[this.model.x_range_name];
    this.ymapper = this.plot_view.frame.y_mappers[this.model.y_range_name];
    this.set_data(false);
    if (this.model.data_source instanceof RemoteDataSource.Model) {
      return this.model.data_source.setup(this.plot_view, this.glyph);
    }
  };

  GlyphRendererView.prototype.build_glyph_view = function(model) {
    return new model.default_view({
      model: model,
      renderer: this,
      plot_view: this.plot_view
    });
  };

  GlyphRendererView.prototype.bind_bokeh_events = function() {
    this.listenTo(this.model, 'change', this.request_render);
    this.listenTo(this.model.data_source, 'change', this.set_data);
    this.listenTo(this.model.data_source, 'patch', this.set_data);
    this.listenTo(this.model.data_source, 'stream', this.set_data);
    this.listenTo(this.model.data_source, 'select', this.request_render);
    if (this.hover_glyph != null) {
      this.listenTo(this.model.data_source, 'inspect', this.request_render);
    }
    return this.listenTo(this.model.glyph, 'propchange', function() {
      this.glyph.set_visuals(this.model.data_source);
      return this.request_render();
    });
  };

  GlyphRendererView.prototype.have_selection_glyphs = function() {
    return (this.selection_glyph != null) && (this.nonselection_glyph != null);
  };

  GlyphRendererView.prototype.set_data = function(request_render, arg) {
    var dt, i, j, k, length, lod_factor, ref, results, source, t0;
    if (request_render == null) {
      request_render = true;
    }
    t0 = Date.now();
    source = this.model.data_source;
    this.glyph.model.setv({
      x_range_name: this.model.x_range_name,
      y_range_name: this.model.y_range_name
    }, {
      silent: true
    });
    this.glyph.set_data(source, arg);
    this.glyph.set_visuals(source);
    this.decimated_glyph.set_visuals(source);
    if (this.have_selection_glyphs()) {
      this.selection_glyph.set_visuals(source);
      this.nonselection_glyph.set_visuals(source);
    }
    if (this.hover_glyph != null) {
      this.hover_glyph.set_visuals(source);
    }
    length = source.get_length();
    if (length == null) {
      length = 1;
    }
    this.all_indices = (function() {
      results = [];
      for (var j = 0; 0 <= length ? j < length : j > length; 0 <= length ? j++ : j--){ results.push(j); }
      return results;
    }).apply(this);
    lod_factor = this.plot_model.plot.lod_factor;
    this.decimated = [];
    for (i = k = 0, ref = Math.floor(this.all_indices.length / lod_factor); 0 <= ref ? k < ref : k > ref; i = 0 <= ref ? ++k : --k) {
      this.decimated.push(this.all_indices[i * lod_factor]);
    }
    dt = Date.now() - t0;
    logger.debug(this.glyph.model.type + " GlyphRenderer (" + this.model.id + "): set_data finished in " + dt + "ms");
    this.set_data_timestamp = Date.now();
    if (request_render) {
      return this.request_render();
    }
  };

  GlyphRendererView.prototype.render = function() {
    var ctx, dtmap, dtmask, dtrender, dtselect, dttot, glsupport, glyph, i, indices, inspected, j, k, len, len1, lod_threshold, nonselected, nonselection_glyph, selected, selected_mask, selection_glyph, t0, tmap, tmask, trender, tselect;
    if (this.model.visible === false) {
      return;
    }
    t0 = Date.now();
    glsupport = this.glyph.glglyph;
    tmap = Date.now();
    this.glyph.map_data();
    dtmap = Date.now() - t0;
    tmask = Date.now();
    indices = this.glyph.mask_data(this.all_indices);
    dtmask = Date.now() - tmask;
    ctx = this.plot_view.canvas_view.ctx;
    ctx.save();
    selected = this.model.data_source.selected;
    if (!selected || selected.length === 0) {
      selected = [];
    } else {
      if (selected['0d'].glyph) {
        selected = indices;
      } else if (selected['1d'].indices.length > 0) {
        selected = selected['1d'].indices;
      } else {
        selected = [];
      }
    }
    inspected = this.model.data_source.inspected;
    if (!inspected || inspected.length === 0) {
      inspected = [];
    } else {
      if (inspected['0d'].glyph) {
        inspected = indices;
      } else if (inspected['1d'].indices.length > 0) {
        inspected = inspected['1d'].indices;
      } else {
        inspected = [];
      }
    }
    lod_threshold = this.plot_model.plot.lod_threshold;
    if (this.plot_view.interactive && !glsupport && (lod_threshold != null) && this.all_indices.length > lod_threshold) {
      indices = this.decimated;
      glyph = this.decimated_glyph;
      nonselection_glyph = this.decimated_glyph;
      selection_glyph = this.selection_glyph;
    } else {
      glyph = this.glyph;
      nonselection_glyph = this.nonselection_glyph;
      selection_glyph = this.selection_glyph;
    }
    if ((this.hover_glyph != null) && inspected.length) {
      indices = _.without.bind(null, indices).apply(null, inspected);
    }
    if (!(selected.length && this.have_selection_glyphs())) {
      trender = Date.now();
      glyph.render(ctx, indices, this.glyph);
      if (this.hover_glyph && inspected.length) {
        this.hover_glyph.render(ctx, inspected, this.glyph);
      }
      dtrender = Date.now() - trender;
    } else {
      tselect = Date.now();
      selected_mask = {};
      for (j = 0, len = selected.length; j < len; j++) {
        i = selected[j];
        selected_mask[i] = true;
      }
      selected = new Array();
      nonselected = new Array();
      for (k = 0, len1 = indices.length; k < len1; k++) {
        i = indices[k];
        if (selected_mask[i] != null) {
          selected.push(i);
        } else {
          nonselected.push(i);
        }
      }
      dtselect = Date.now() - tselect;
      trender = Date.now();
      nonselection_glyph.render(ctx, nonselected, this.glyph);
      selection_glyph.render(ctx, selected, this.glyph);
      if (this.hover_glyph != null) {
        this.hover_glyph.render(ctx, inspected, this.glyph);
      }
      dtrender = Date.now() - trender;
    }
    this.last_dtrender = dtrender;
    dttot = Date.now() - t0;
    logger.debug(this.glyph.model.type + " GlyphRenderer (" + this.model.id + "): render finished in " + dttot + "ms");
    logger.trace(" - map_data finished in       : " + dtmap + "ms");
    if (dtmask != null) {
      logger.trace(" - mask_data finished in      : " + dtmask + "ms");
    }
    if (dtselect != null) {
      logger.trace(" - selection mask finished in : " + dtselect + "ms");
    }
    logger.trace(" - glyph renders finished in  : " + dtrender + "ms");
    return ctx.restore();
  };

  GlyphRendererView.prototype.map_to_screen = function(x, y) {
    return this.plot_view.map_to_screen(x, y, this.model.x_range_name, this.model.y_range_name);
  };

  GlyphRendererView.prototype.draw_legend = function(ctx, x0, x1, y0, y1, field, label) {
    var index;
    index = this.model.get_reference_point(field, label);
    return this.glyph.draw_legend_for_index(ctx, x0, x1, y0, y1, index);
  };

  GlyphRendererView.prototype.hit_test = function(geometry) {
    return this.glyph.hit_test(geometry);
  };

  return GlyphRendererView;

})(Renderer.View);

GlyphRenderer = (function(superClass) {
  extend(GlyphRenderer, superClass);

  function GlyphRenderer() {
    return GlyphRenderer.__super__.constructor.apply(this, arguments);
  }

  GlyphRenderer.prototype.default_view = GlyphRendererView;

  GlyphRenderer.prototype.type = 'GlyphRenderer';

  GlyphRenderer.prototype.get_reference_point = function(field, value) {
    var data, i, index;
    index = 0;
    if ((field != null) && (this.data_source.get_column != null)) {
      data = this.data_source.get_column(field);
      if (data) {
        i = data.indexOf(value);
        if (i > 0) {
          index = i;
        }
      }
    }
    return index;
  };

  GlyphRenderer.define({
    x_range_name: [p.String, 'default'],
    y_range_name: [p.String, 'default'],
    data_source: [p.Instance],
    glyph: [p.Instance],
    hover_glyph: [p.Instance],
    nonselection_glyph: [p.Instance],
    selection_glyph: [p.Instance]
  });

  GlyphRenderer.override({
    level: 'glyph'
  });

  GlyphRenderer.prototype.selection_defaults = {
    fill: {},
    line: {}
  };

  GlyphRenderer.prototype.decimated_defaults = {
    fill: {
      fill_alpha: 0.3,
      fill_color: "grey"
    },
    line: {
      line_alpha: 0.3,
      line_color: "grey"
    }
  };

  GlyphRenderer.prototype.nonselection_defaults = {
    fill: {
      fill_alpha: 0.2,
      line_alpha: 0.2
    },
    line: {}
  };

  return GlyphRenderer;

})(Renderer.Model);

module.exports = {
  Model: GlyphRenderer,
  View: GlyphRendererView
};
