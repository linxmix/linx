import Ember from 'ember';

import _ from 'npm:underscore';
import d3 from 'd3';

import RequireAttributes from 'linx/lib/require-attributes';

// Interface for controlling Arrangement Visuals
export default Ember.Mixin.create({

  // optional params
  pxPerBeat: 20,
  rowHeight: 128,

  // params
  zoom: Ember.computed(function() {
    return d3.behavior.zoom();
  }),

  $svg: Ember.computed(function() {
    return this.$('.ArrangementVisual svg');
  }).volatile(),

  svgSelection: Ember.computed('$svg', function() {
    return d3.select('.ArrangementVisual svg');
  }).volatile(),

  actions: {
    zoomToClip(clip, doTransition) {
      const centerBeat = clip.get('centerBeat');
      const pxPerBeat = this.get('pxPerBeat');
      const clipWidthPx = clip.get('beatCount') * pxPerBeat;
      const viewWidthPx = this._getSvgWidth();
      const scale = viewWidthPx / clipWidthPx;
      this.send('zoomToBeat', centerBeat, scale, doTransition);
    },

    zoomToBeat(beat, scale, doTransition = true) {
      const zoom = this.get('zoom');
      const prevScale = zoom.scale();
      scale = scale || prevScale;
      let [ translateX, translateY ] = zoom.translate();
      const pxPerBeat = this.get('pxPerBeat');
      const svgSelection = this.get('svgSelection');

      Ember.assert('Must have svgSelection to zoom', !!svgSelection);

      // calculate desired center
      const svgWidth = this._getSvgWidth();
      translateX = (svgWidth / 2.0) - (beat * pxPerBeat * scale);

      // possibly animate zoom on svg selection
      if (doTransition) {
        svgSelection
          .call(zoom.translate(zoom.translate()).event)
          .call(zoom.scale(prevScale).event)
          .transition()
          .duration(500) // TODO(SVG) make duration base off trnslate difference
          .call(zoom.scale(scale).event)
          .call(zoom.translate([ translateX, translateY ]).event);
      } else {
        svgSelection
          .call(zoom.scale(scale).event)
          .call(zoom.translate([ translateX, translateY ]).event);
      }
    }
  },

  _getSvgWidth() {
    const $svg = this.get('$svg');
    return $svg ? $svg.width() : 0;
  },
});
