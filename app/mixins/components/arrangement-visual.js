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
    return d3.select(this.get('$svg'));
  }).volatile(),

  actions: {
    // TODO(SVG): upgrade this to zoomToBoundingBox
    zoomToClip(clip) {
      const centerBeat = clip.get('centerBeat');
      this.send('zoomToBeat', centerBeat);
    },

    zoomToBeat(beat) {
      const zoom = this.get('zoom');
      let [ translateX, translateY ] = zoom.translate();
      const svgSelection = this.get('svgSelection');

      Ember.assert('Must have svgSelection to zoom', !!svgSelection);

      // calculate desired center
      const svgWidth = this._getSvgWidth();
      translateX = ((svgWidth / 2.0) - beat) * this.get('pxPerBeat');

      // animate zoom on svg selection
      // TODO(SVG): figure this out
      svgSelection
        .transition()
        .duration(1000)
        .call(zoom.translate([ translateX, translateY ]).event);
    }
  },

  _getSvgWidth() {
    const $svg = this.get('$svg');
    return $svg ? $svg.width() : 0;
  },
});
