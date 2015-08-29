import Ember from 'ember';
import DS from 'ember-data';
import AbstractListMixin from 'linx/mixins/models/abstract-list';
import isEvery from 'linx/lib/computed/is-every';

export default DS.Model.extend(
  AbstractListMixin('arrangement-event', { polymorphic: true, saveItems: false }), {
  type: 'arrangement',

  // params
  events: Ember.computed.alias('items'),
  clips: Ember.computed.mapBy('events', 'clip'),

  isReady: isEvery('events', 'isReady', true),

  eventSort: ['endBeat:asc'],
  sortedEvents: Ember.computed.sort('events', 'eventSort'),
  lastBeat: Ember.computed.reads('sortedEvents.lastObject.lastBeat'),
  numBeats: Ember.computed.reads('lastBeat'),

  save: function() {
    console.log('save arrangement');
    return this._super.apply(this, arguments);
  }
});
