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

  // _prevPxPerBeat: 0,
  // _recenterOnZoom: function() {
  //   let { pxPerBeat, _prevPxPerBeat } = this.getProperties('pxPerBeat', '_prevPxPerBeat');
  //   let $this = this.$();

  //   // calculate prev position
  //   let prevX = $this.scrollLeft();
  //   let prevPosition = prevX /

  //   // calculate desired position

  //   console.log("recenter", 0, x, maxScroll);

  //   // scroll to desired position
  //   let maxScroll = $this[0].scrollWidth - $this.innerWidth();
  //   $this.scrollLeft = clamp(0, x, maxScroll);
  // }.observes('pxPerBeat'),

  playheadPx: function() {
    return (this.get('metronome.tickBeat') * this.get('pxPerBeat')) + 'px';
  }.property('metronome.tickBeat', 'pxPerBeat'),
});
