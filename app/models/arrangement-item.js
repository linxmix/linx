import Ember from 'ember';
import DS from 'ember-data';
import AbstractListItemMixin from 'linx/lib/models/abstract-list-item';

// Wraps Clip models to hold arrangement information
export default DS.Model.extend(
  AbstractListItemMixin('arrangement'), {

  arrangement: DS.belongsTo('arrangement', { async: true }),

  row: DS.attr('number'), // in complex display
  startBeat: DS.attr('number'),

  numBeats: Ember.computed.alias('clip.numBeats'),
  endBeat: Ember.computed.alias('clip.endBeat'),

  type: Ember.computed.alias('clip.type'),
  isReady: Ember.computed.alias('clip.isReady'),

  clip: DS.belongsTo('clip', { polymorphic: true, async: true }),
});
