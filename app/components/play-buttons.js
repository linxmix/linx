import Ember from 'ember';
import BubbleActions from 'linx/lib/bubble-actions';

export default Ember.Component.extend(
  BubbleActions('playpause', 'skipBack', 'skipForth'), {

  // optional params
  isPlaying: false,
  isDisabled: false,

  classNames: ['PlayButtons'],
});
