import Ember from 'ember';
import DS from 'ember-data';

import add from 'linx/lib/computed/add';

// Wraps Clip models to hold arrangement information
export default DS.Model.extend(
  RequireAttributes('startBeat', 'numBeats', 'endBeat') ,{

  type: 'arrangement-item',

  arrangement: DS.belongsTo('arrangement', { async: true }),

  row: DS.attr('number'), // in complex display
  startBeat: DS.attr('number'),

  numBeats: Ember.computed.reads('clip.numBeats'),
  clipType: Ember.computed.reads('clip.type'),
  isReady: Ember.computed.reads('clip.isReady'),

  endBeat: add('startBeat', 'numBeats'),

  clip: DS.belongsTo('clip', { polymorphic: true, async: true }),
});
