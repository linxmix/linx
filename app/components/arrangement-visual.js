import Ember from 'ember';

import DataVisual from 'ember-cli-d3/components/data-visual';

import BubbleActions from 'linx/lib/bubble-actions';
import RequireAttributes from 'linx/lib/require-attributes';
import PreventMacBackScroll from 'linx/mixins/prevent-mac-back-scroll';
import cssStyle from 'linx/lib/computed/css-style';
import { clamp, isNumber } from 'linx/lib/utils';

// used for cancelAnimationFrame
let playheadAnimationId;

// TODO(SVG): rename to arrangement-visual
export default DataVisual.extend(
  // PreventMacBackScroll,
  RequireAttributes('arrangement'),
  BubbleActions('seekToClick'), {

  // optional params
  isReady: false,
  zoom: Ember.computed(() => d3.behavior.zoom()),

  classNames: ['ArrangementVisual'],
  classNameBindings: ['isReady::ArrangementVisual--loading'],

  didZoom() {
    const { zoom, minX, maxX, minY, maxY } = this.getProperties('zoom', 'minX', 'maxX', 'minY', 'maxY');
    const translate = zoom.translate();

    let scale = zoom.scale();
    translate[0] = clamp(-(maxX * scale), translate[0], 0);
    // translate[1] = clamp(minY, translate[1], maxY * scale);
    translate[1] = 0;
    zoom.translate(translate);
    console.log('didZoom', translate, scale);
    this.get('selection').attr('transform', `translate(${translate}) scale(${scale}, 1)`);
  },

  minX: 0,
  maxX: Ember.computed.reads('arrangement.beatCount'),
  minY: 0,
  maxY: 128, // TODO(SVG)

  beatScale: Ember.computed('maxX', function () {
    // let rangeMax = this.get('arrangementWidth');
    let domainMax = this.get('maxX');

    return d3.scale.linear().domain([1, domainMax + 1]);
  }).readOnly(),

  svg: Ember.computed.reads('stage.svg.select'),
  select: Ember.computed.reads('svg.ArrangementVisual-arrangement'),
  selection: Ember.computed.reads('select.selection'),

  setupZoom: Ember.observer('svg.selection', 'zoom', function() {
    const { 'svg.selection': selection, zoom } = this.getProperties('svg.selection', 'zoom');

    // TODO(CLEANUP): need to call 'off' on willDestroy. or just destroy zoom and svg?
    // not easy to undo zoom
    // http://stackoverflow.com/questions/22302919/unregister-zoom-listener-and-restore-scroll-ability-in-d3-js/22303160?noredirect=1#22303160
    if (selection && zoom) {
      zoom.on('zoom', this.didZoom.bind(this));
      zoom(selection);
    }
  }).on('didInsertElement'),

  // // playhead logic
  // metronome: Ember.computed.reads('arrangement.metronome'),

  // startPlayheadAnimation: Ember.observer('metronome.isPlaying', 'metronome.seekBeat', function() {
  //   let context = this;
  //   let $playhead = this.$('.ArrangementVisual-playhead');

  //   // uses requestAnimationFrame to animate the arrangement-visual's playhead
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
