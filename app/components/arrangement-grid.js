import Ember from 'ember';

import BubbleActions from 'linx/lib/bubble-actions';
import RequireAttributes from 'linx/lib/require-attributes';

import cssStyle from 'linx/lib/computed/css-style';
import { clamp } from 'linx/lib/utils';

export default Ember.Component.extend(
  RequireAttributes('arrangement', 'metronome', 'pxPerBeat'),
  BubbleActions('seekToClick'), {

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

  _scrollHandler: null,
  _setupScrollHandler: function() {
    let scrollHandler = (e) => {
      this.set('_prevScroll', this.$().scrollLeft());
    };

    this.$().on('scroll', scrollHandler);

    this.set('_scrollHandler', scrollHandler);
  }.on('didInsertElement'),

  _teardownScrollHandler: function() {
    this.$().off('scroll', this.get('_scrollHandler'));
  }.on('willDestroyElement'),

  _prevScroll: 0,
  _prevPxPerBeat: Ember.computed.reads('pxPerBeat'),
  _recenterOnZoom: function() {
    let { pxPerBeat, _prevPxPerBeat: prevPxPerBeat, _prevScroll: prevScroll } = this.getProperties('pxPerBeat', '_prevPxPerBeat', '_prevScroll');

    this.set('_prevPxPerBeat', pxPerBeat);
    if (prevPxPerBeat <= 0) {
      return;
    }

    // calculate the beat that was at the center, then scroll to it
    let beat = (prevScroll + this.getHalfWidth()) / prevPxPerBeat;
    this.scrollToBeat(beat);
  }.observes('pxPerBeat'),

  getHalfWidth() {
    return this.$().innerWidth() / 2.0;
  },

  scrollToBeat(beat) {
    let pxPerBeat = this.get('pxPerBeat');
    let $this = this.$();

    // since we are setting scrollLeft, adjust halfway
    let beatPx = (pxPerBeat * beat) - this.getHalfWidth();
    let maxScroll = $this[0].scrollWidth - $this.innerWidth();

    console.log("scrollToBeat", beat);
    $this.scrollLeft(clamp(0, beatPx, maxScroll));
  },

  playheadPx: function() {
    return (this.get('metronome.tickBeat') * this.get('pxPerBeat')) + 'px';
  }.property('metronome.tickBeat', 'pxPerBeat'),
});
