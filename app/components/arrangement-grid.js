import Ember from 'ember';

import BubbleActions from 'linx/lib/bubble-actions';
import RequireAttributes from 'linx/lib/require-attributes';

import cssStyle from 'linx/lib/computed/css-style';
import { clamp, isNumber } from 'linx/lib/utils';

export default Ember.Component.extend(
  RequireAttributes('arrangement', 'metronome', 'pxPerBeat'),
  BubbleActions('seekToClick'), {

  // optional params
  scrollCenterBeat: null,
  centerBeat: 0,

  classNames: ['ArrangementGrid'],
  classNameBindings: ['isReady::ArrangementGrid--loading'],

  playheadStyle: cssStyle({
    'left': 'playheadPx'
  }),

  // on click, seekToBeat
  click(e) {
    let $el = this.$();
    let offsetX = e.pageX - ($el.offset().left);
    let scrollLeft = ($el.scrollLeft());
    let x = offsetX + scrollLeft;
    let beat = x / this.get('pxPerBeat');

    this.sendAction('seekToBeat', beat);
  },

  _scrollToCenterBeat: function() {
    if (this.get('arrangement.isReady')) {
      let scrollCenterBeat = this.get('scrollCenterBeat');

      if (isNumber(scrollCenterBeat)) {
        this.scrollToBeat(scrollCenterBeat);
      }
    }
  }.observes('scrollCenterBeat', 'arrangement.isReady'),

  _scrollHandler: null,
  _setupScrollHandler: function() {
    let scrollHandler = (e) => {
      this._updateCenterBeat();
    };

    this.$().on('scroll', scrollHandler);

    this.set('_scrollHandler', scrollHandler);
  }.on('didInsertElement'),

  _teardownScrollHandler: function() {
    this.$().off('scroll', this.get('_scrollHandler'));
  }.on('willDestroyElement'),

  _updateCenterBeat() {
    let centerBeat = (this.$().scrollLeft() + this.getHalfWidth()) / this.get('pxPerBeat');
    this.set('centerBeat', centerBeat);
  },

  _recenterOnZoom: function() {
    this.scrollToBeat(this.get('centerBeat'), false);
  }.observes('pxPerBeat'),

  getHalfWidth() {
    return this.$().innerWidth() / 2.0;
  },

  scrollToBeat(beat, doAnimate = true) {
    let pxPerBeat = this.get('pxPerBeat');
    let $this = this.$();

    // since we are setting scrollLeft, adjust halfway
    let beatPx = (pxPerBeat * beat) - this.getHalfWidth();
    let maxScroll = $this[0].scrollWidth - $this.innerWidth();
    let scrollLeft = clamp(0, beatPx, maxScroll);

    if (doAnimate) {
      $this.animate({
        scrollLeft: scrollLeft
      });
    } else {
      $this.scrollLeft(scrollLeft);
    }

    this._updateCenterBeat();
  },

  playheadPx: function() {
    return (this.get('metronome.tickBeat') * this.get('pxPerBeat')) + 'px';
  }.property('metronome.tickBeat', 'pxPerBeat'),

  arrangementWidth: function() {
    return this.get('arrangement.numBeats') * this.get('pxPerBeat');
  }.property('arrangement.numBeats', 'pxPerBeat'),

  //
  // TODO(D3): figure this out
  //

  arrangementWidthStyle: Ember.computed('arrangementWidth', function() {
    return `${this.get('arrangementWidth')}px`;
  }),

  beatgridStyle: cssStyle({
    width: 'arrangementWidthStyle'
  }),

  tickHeight: 25,
  padding: 50,

  numBeats: Ember.computed.reads('arrangement.numBeats'),
  numBars: Ember.computed.reads('arrangement.numBars'),
  xScale: Ember.computed('arrangementWidth', 'numBars', function () {
    let rangeMax = this.get('arrangementWidth');
    let domainMax = this.get('numBars');

    return d3.scale.linear().domain([1, domainMax + 1]).range([0, rangeMax]);
  }).readOnly(),

  // scale ticks based on zoom
  ticksOnScreen: 10,
  ticks: Ember.computed('arrangementWidth', 'ticksOnScreen', function() {
    let ticksOnScreen = this.get('ticksOnScreen');
    let width = this.$().width();
    let arrangementWidth = this.get('arrangementWidth');

    let ticks = ticksOnScreen * (arrangementWidth / width);
    return ticks;
  }),
});
