import Ember from 'ember';
import DS from 'ember-data';

// Wraps Clip models to hold arrangement information
export default DS.Model.extend(
  RequireAttributes('startBeat', 'numBeats', 'endBeat') ,{

  type: Ember.computed(() => { return 'arrangement-item'; }),

  arrangement: DS.belongsTo('arrangement', { async: true }),

  row: DS.attr('number'), // in complex display
  startBeat: DS.attr('number'),

  numBeats: Ember.computed.alias('clip.numBeats'),
  endBeat: Ember.computed.alias('clip.endBeat'),

  clipType: Ember.computed.alias('clip.type'),
  isReady: Ember.computed.alias('clip.isReady'),

  clip: DS.belongsTo('clip', { polymorphic: true, async: true }),
});
