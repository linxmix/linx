import Ember from 'ember';
import DS from 'ember-data';
import AbstractListMixin from 'linx/lib/models/abstract-list';
import isEvery from 'linx/lib/computed/is-every';

export default DS.Model.extend(
  AbstractListMixin('arrangement-item', { polymorphic: true, saveItems: false }), {

  // params
  clips: Ember.computed.mapBy('items', 'clip'),
  audioClips: Ember.computed.filterBy('clips', 'type', 'audio-clip'),
  trackClips: Ember.computed.filterBy('clips', 'type', 'track-clip'),
  automationClips: Ember.computed.filterBy('clips', 'type', 'automation-clip'),

  isReady: isEvery('clips', 'isReady', true),

  itemSort: ['endBeat:asc'],
  sortedItems: Ember.computed.sort('items', 'itemSort'),
  lastBeat: Ember.computed.alias('sortedItems.lastObject.lastBeat'),
  numBeats: Ember.computed.alias('lastBeat'),

  appendArrangement: function(startBeat, arrangement) {
    // TODO(TRANSITION)
  },

  save: function() {
    console.log('save arrangement');
    return this._super.apply(this, arguments);
  }
});
