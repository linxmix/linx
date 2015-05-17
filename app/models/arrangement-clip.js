import Ember from 'ember';
import DS from 'ember-data';

// Wraps Clip models to hold arrangement information
export default DS.Model.extend({
  start: DS.attr('number'),

  arrangementRow: DS.belongsTo('arrangement-row'),
  audioClip: DS.belongsTo('audio-clip'),
  automationClip: DS.belongsTo('automation-clip'),

  // underlying clip model
  clipModel: Ember.computed.or('audioClip', 'automationClip'),
  clipLength: Ember.computed.alias('clipModel.length'),
  clipType: Ember.computed.alias('clipModel.type'),
});
