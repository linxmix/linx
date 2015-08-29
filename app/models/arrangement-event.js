import Ember from 'ember';
import DS from 'ember-data';

import OrderedHasManyItemMixin from 'linx/mixins/models/ordered-has-many-item';

import add from 'linx/lib/computed/add';

// Wraps Clip models to hold arrangement information
export default DS.Model.extend(
  OrderedHasManyItemMixin('arrangement'),
  RequireAttributes('startBeat', 'numBeats', 'endBeat'), {
  type: 'arrangement-event',

  arrangement: DS.belongsTo('arrangement', { async: true, polymorphic: true }),
  clip: DS.belongsTo('clip', { polymorphic: true, async: true }),

  row: DS.attr('number'), // in complex display
  startBeat: DS.attr('number', { defaultValue: 0 }),

  // helpful properties
  prevEvent: Ember.computed.reads('prevItem'),
  nextEvent: Ember.computed.reads('nextItem'),

  numBeats: Ember.computed.reads('clip.numBeats'),
  clipType: Ember.computed.reads('clip.type'),
  isReady: Ember.computed.reads('clip.isReady'),

  endBeat: add('startBeat', 'numBeats'),
});
