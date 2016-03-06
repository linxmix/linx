import Ember from 'ember';

import BubbleActions from 'linx/lib/bubble-actions';
import RequireAttributes from 'linx/lib/require-attributes';

import add from 'linx/lib/computed/add';
import equalProps from 'linx/lib/computed/equal-props';
import { FROM_TRACK_COLOR, TO_TRACK_COLOR } from 'linx/components/simple-mix';

export default Ember.Component.extend(
  BubbleActions('remove', 'viewTrack', 'viewTransition', 'play'), RequireAttributes('item'), {

  actions: {},
  classNames: ['MixListItem', 'item'],
  classNameBindings: [],

  // optional params
  selectedClip: null,

  // params
  transition: Ember.computed.reads('item.transition'),
  track: Ember.computed.reads('item.track'),
  mix: Ember.computed.reads('item.mix'),

  isSelectedTransitionClip: equalProps('selectedClip', 'item.transitionClip'),

  isSelectedFromTrackClip: Ember.computed.reads('isSelectedTransitionClip'),
  isSelectedToTrackClip: equalProps('selectedClip', 'item.prevItem.transitionClip'),

  trackColor: Ember.computed('isSelectedFromTrackClip', 'isSelectedToTrackClip', function() {
    if (this.get('isSelectedFromTrackClip')) return FROM_TRACK_COLOR;
    if (this.get('isSelectedToTrackClip')) return TO_TRACK_COLOR;
  }),

  index: Ember.computed.reads('item.index'),
  position: Ember.computed.reads('item.position'),
  lastPosition: add('position', 1),
  isLastItem: equalProps('position', 'mix.length'),

  showFromTrack: Ember.computed.bool('toTrack.content'),
  showToTrack: Ember.computed.and('isLastItem', 'toTrack.content'),
});

