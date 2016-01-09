import Ember from 'ember';

import DataVisual from 'ember-cli-d3/components/data-visual';
import d3 from 'd3';

import BubbleActions from 'linx/lib/bubble-actions';
import RequireAttributes from 'linx/lib/require-attributes';
import PreventMacBackScroll from 'linx/mixins/prevent-mac-back-scroll';
import cssStyle from 'linx/lib/computed/css-style';
import { clamp, isNumber } from 'linx/lib/utils';

// used for cancelAnimationFrame
let playheadAnimationId;

export default DataVisual.extend(
  // PreventMacBackScroll,
  RequireAttributes('pxPerBeat', 'arrangement'),
  BubbleActions('seekToClick'), {

  // optional params
  isReady: false,
  scrollCenterBeat: 0,
  pxPerBeat: null,

  classNames: ['ArrangementGrid'],
  classNameBindings: ['isReady::ArrangementGrid--loading'],

  // playhead logic
  metronome: Ember.computed.reads('arrangement.metronome'),

  // startPlayheadAnimation: Ember.observer('metronome.isPlaying', 'metronome.seekBeat', function() {
  //   let context = this;
  //   let $playhead = this.$('.ArrangementGrid-playhead');

  //   // uses requestAnimationFrame to animate the arrangement-grid's playhead
  //   function animatePlayhead() {
  //     let metronome = context.get('metronome');
  //     let pxPerBeat = context.get('pxPerBeat');
  //     let currentBeat = metronome.getCurrentBeat();
  //     let currentPx = pxPerBeat * currentBeat;

  //     $playhead.css('left', currentPx);

  //     if (metronome.get('isPlaying')) {
  //       playheadAnimationId = window.requestAnimationFrame(animatePlayhead);
  //     } else {
  //       playheadAnimationId = undefined;
  //     }
  //   }

  //   this.stopPlayheadAnimation();
  //   animatePlayhead();
  // }).on('didInsertElement'),

  // stopPlayheadAnimation: function() {
  //   window.cancelAnimationFrame(playheadAnimationId);
  // }.on('willDestroyElement'),

  zoom: Ember.computed(function() {
    return d3.behavior.zoom()
      .scaleExtent([0.1, 3])
      .on('zoom', () => {
        console.log("ZOOM", d3.event.translate, d3.event.scale);
        this.get('selection').attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")")
      });
  }),

  svg: Ember.computed('stage', function() {
    return this.get('stage.svg.select');
  }),

  select: Ember.computed('svg', 'zoom', function() {
    const svg = this.get('svg');

    if (svg) {
      svg.get('selection').call(this.get('zoom'));
      return svg.get('.ArrangementGrid');
    }
  }),
  // actual d3 selection
  selection: Ember.computed.reads('select.selection'),

  setupZoomHandler: Ember.observer('selection', 'zoom', function() {
    const { selection, zoom } = this.getProperties('selection', 'zoom');

    // TODO(CLEANUP): need to call 'off' on willDestroy
    if (selection && zoom) {
      // zoom(selection);
    }
  }).on('didInsertElement'),

  // on click, seekToBeat
  // click(e) {
  //   let $el = this.$();
  //   let offsetX = e.pageX - ($el.offset().left);
  //   let scrollLeft = ($el.scrollLeft());
  //   let x = offsetX + scrollLeft;
  //   let beat = x / this.get('pxPerBeat');

  //   this.sendAction('seekToBeat', beat);
  // },

  // _recenterOnZoom: function(options) {
  //   let { oldAttrs, newAttrs } = options;
  //   let { pxPerBeat: oldPxPerBeat } = oldAttrs || {};
  //   let { pxPerBeat: newPxPerBeat } = newAttrs || {};

  //   // update centerBeat before attrs update, recenter after attrs update
  //   if (oldPxPerBeat && (oldPxPerBeat.value !== newPxPerBeat.value)) {
  //     let centerBeat = this.getCenterBeat(oldPxPerBeat.value);
  //     console.log('recenterOnZoom', centerBeat);
  //     this.one('didRender', () => {
  //       this.scrollToBeat(centerBeat, false);
  //     });
  //   }
  // }.on('didReceiveAttrs'),

  // scrollToCenterBeat: function() {
  //   if (this.get('isReady')) {
  //     let scrollCenterBeat = this.get('scrollCenterBeat');

  //     if (isNumber(scrollCenterBeat)) {
  //       console.log("scrollToCenterBeat");
  //       this.scrollToBeat(scrollCenterBeat);
  //     }
  //   }
  // }.observes('scrollCenterBeat', 'isReady'),

  // getCenterBeat(pxPerBeat) {
  //   if (this.get('isInDom')) {
  //     pxPerBeat = pxPerBeat || this.get('pxPerBeat');
  //     let centerBeat = (this.$().scrollLeft() + this.getHalfWidth()) / pxPerBeat;
  //     return centerBeat;
  //   } else {
  //     return 0;
  //   }
  // },

  // getHalfWidth() {
  //   return this.$().innerWidth() / 2.0;
  // },

  // getMaxScroll() {
  //   let $this = this.$();
  //   return $this[0].scrollWidth - $this.innerWidth();
  // },

  // scrollToBeat(beat, doAnimate = true) {
  //   console.log('scrollToBeat', beat);
  //   let pxPerBeat = this.get('pxPerBeat');
  //   let $this = this.$();

  //   // since we are setting scrollLeft, adjust halfway
  //   let beatPx = (pxPerBeat * beat) - this.getHalfWidth();
  //   let scrollLeft = clamp(0, beatPx, this.getMaxScroll());

  //   if (doAnimate) {
  //     $this.animate({
  //       scrollLeft: scrollLeft
  //     });
  //   } else {
  //     $this.scrollLeft(scrollLeft);
  //   }
  // },
});
