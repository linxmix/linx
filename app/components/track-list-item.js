import Ember from 'ember';
import BubbleActions from 'linx/lib/bubble-actions';
import RequireAttributes from 'linx/lib/require-attributes';

export default Ember.Component.extend(
  BubbleActions('removeTrack', 'addTrack', 'playTrack'), RequireAttributes('item'), {

  track: Ember.computed.alias('item.track'),

  classNames: ['TrackListItem', 'item'],
  classNameBindings: [],

  // params
  foo: 'bar',
});

