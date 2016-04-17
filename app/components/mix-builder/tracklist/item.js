import Ember from 'ember';

import add from 'linx/lib/computed/add';
import equalProps from 'linx/lib/computed/equal-props';
import { FROM_TRACK_COLOR, TO_TRACK_COLOR } from 'linx/components/mix-builder';

export default Ember.Component.extend({
  tagName: 'tr',
  classNames: ['MixBuilderTracklistItem'],

  // required params
  item: null,

  // optional params
  selectedTransition: null,

  // params
  transition: Ember.computed.reads('item.transition'),
  track: Ember.computed.reads('item.track'),
  mix: Ember.computed.reads('item.mix'),

  isSelectedTransition: equalProps('selectedTransition', 'item.transition'),
  isSelectedFromTrack: Ember.computed.reads('isSelectedTransition'),
  isSelectedToTrack: equalProps('selectedTransition', 'item.prevTransition'),

  trackColor: Ember.computed('isSelectedFromTrack', 'isSelectedToTrack', function() {
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

