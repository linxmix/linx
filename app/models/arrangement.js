import Ember from 'ember';
import DS from 'ember-data';

import OrderedHasManyMixin from 'linx/mixins/models/ordered-has-many';

import isEvery from 'linx/lib/computed/is-every';
import withDefault from 'linx/lib/computed/with-default';

export default DS.Model.extend(
  OrderedHasManyMixin('arrangement-event', { polymorphic: true }), {
  type: 'arrangement',

  // params
  events: Ember.computed.alias('items'),
  clips: Ember.computed.mapBy('events', 'clip'),

  isReady: isEvery('events', 'isReady', true),

  eventSort: ['endBeat:asc'],
  sortedEvents: Ember.computed.sort('events', 'eventSort'),
  lastBeat: Ember.computed.reads('sortedEvents.lastObject.lastBeat'),
  numBeats: withDefault('lastBeat', 0),

  save: function() {
    console.log('save arrangement');
    return this._super.apply(this, arguments);
  }
});
