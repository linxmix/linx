import Ember from 'ember';
import DS from 'ember-data';

export default DS.Model.extend({
  title: DS.attr('string'),
  isTemplate: DS.attr('bool'),

  fromTrackEndBeat: DS.attr('number'),
  toTrackStartBeat: DS.attr('number'),
  lengthBeats: DS.attr('number'),

  fromTrack: DS.belongsTo('track', { async: true }),
  toTrack: DS.belongsTo('track', { async: true }),

  template: DS.belongsTo('transition-template', { async: true }),
});
