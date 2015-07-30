import Ember from 'ember';
import DS from 'ember-data';
import AbstractListMixin from 'linx/lib/models/abstract-list';
import { flatten } from 'linx/lib/utils';

export default DS.Model.extend(
  AbstractListMixin('arrangement-item'), {

  // params
  clips: Ember.computed.mapBy('items', 'clip'),
  audioClips: Ember.computed.filterBy('clips', 'type', 'audio-clip'),
  trackClips: Ember.computed.filterBy('clips', 'type', 'track-clip'),
  automationClips: Ember.computed.filterBy('clips', 'type', 'automation-clip'),

  appendArrangement: function(startBeat, arrangement) {
    // TODO(TRANSITION)
  },

  totalBeats: function() {
    // TODO off sortedClips.lastBeat
  }.property('foo'),

  save: function() {
    console.log('save arrangement');
    return this._super.apply(this, arguments);
  }
});
