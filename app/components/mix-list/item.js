import Ember from 'ember';

import BubbleActions from 'linx/lib/bubble-actions';
import RequireAttributes from 'linx/lib/require-attributes';

import add from 'linx/lib/computed/add';
import equalProps from 'linx/lib/computed/equal-props';

export default Ember.Component.extend(
  BubbleActions('remove', 'view', 'play'), RequireAttributes('item'), {

  actions: {},
  classNames: ['MixListItem', 'item'],
  classNameBindings: [],

  // params
  transition: Ember.computed.reads('item.transition'),
  track: Ember.computed.reads('item.track'),
  mix: Ember.computed.reads('item.mix'),

  index: Ember.computed.reads('item.index'),
  position: Ember.computed.reads('item.position'),
  lastPosition: add('position', 1),
  isLastItem: equalProps('position', 'mix.length'),

  showFromTrack: Ember.computed.bool('toTrack.content'),
  showToTrack: Ember.computed.and('isLastItem', 'toTrack.content'),
});

