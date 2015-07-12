import Ember from 'ember';
import BubbleActions from 'linx/lib/bubble-actions';
import RequireAttributes from 'linx/lib/require-attributes';

export default Ember.Component.extend(
  BubbleActions('removeTrack'), RequireAttributes('item'), {

  actions: {
    removeTrack: function() {
      this.sendAction('removeTrack', this.get('track'));
    }
  },

  track: Ember.computed.alias('track.item'),

  classNames: ['TrackListItem', 'item'],
  classNameBindings: [],

  // params
  foo: 'bar',
});

