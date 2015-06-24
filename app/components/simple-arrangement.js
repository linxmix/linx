import Ember from 'ember';
import BubbleActions from 'linx/lib/bubble-actions';

export default Ember.Component.extend(
  BubbleActions('seekToClick'), {

  classNames: ['SimpleArrangement'],

  classNameBindings: ['isReady::SimpleArrangement--loading'],

  click: function(e) {
    this.sendAction('seekToClick', e, e.offsetX);
  }
});
