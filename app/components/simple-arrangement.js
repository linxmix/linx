import Ember from 'ember';
import BubbleActions from 'linx/lib/bubble-actions';
import RequireAttributes from 'linx/lib/require-attributes';
import cssStyle from 'linx/lib/computed/css-style';

// TODO: figure this out
export const PX_PER_SEC = 20;

export default Ember.Component.extend(
  RequireAttributes('arrangement', 'metronome'),
  BubbleActions('seekToClick'), {

  classNames: ['SimpleArrangement'],
  classNameBindings: ['isReady::SimpleArrangement--loading'],

  playheadStyle: cssStyle({
    'left': 'playheadPx'
  }),

  click: function(e) {
    this.sendAction('seekToClick', e, e.offsetX);
  },

  playheadPx: function() {
    return this.timeToPx(this.get('metronome.tickTime')) + 'px';
  }.property('metronome.tickTime'),

  timeToPx: function(time) {
    return time * PX_PER_SEC; // s * (px / s) = px
  }
});
