import Ember from 'ember';
import DS from 'ember-data';

import OrderedHasManyMixin from 'linx/mixins/models/ordered-has-many';

import isEvery from 'linx/lib/computed/is-every';
import withDefault from 'linx/lib/computed/with-default';

export default DS.Model.extend(
  OrderedHasManyMixin('clip', { polymorphic: true }), {

  // params
  clips: Ember.computed.alias('items'),
  validClips: Ember.computed.filterBy('clips', 'isValid', true),

  isReady: isEvery('clips', 'isReady', true),

  clipSort: ['endBeat:asc'],
  sortedClips: Ember.computed.sort('clips', 'clipSort'),
  lastBeat: Ember.computed.reads('sortedCips.lastObject.lastBeat'),
  numBeats: withDefault('lastBeat', 0),

  save: function() {
    console.log('save arrangement');
    return this._super.apply(this, arguments);
  }
});
