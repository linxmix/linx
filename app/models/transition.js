import Ember from 'ember';
import DS from 'ember-data';
import withDefaultModel from 'linx/lib/computed/with-default-model';

export default DS.Model.extend({
  title: DS.attr('string'),
  isTemplate: DS.attr('bool'),

  fromTime: DS.attr('number'), // start time of fromTrack
  toTime: DS.attr('number'), // end time of toTrack

  fromTrack: DS.belongsTo('track', { async: true }),
  toTrack: DS.belongsTo('track', { async: true }),

  arrangment: DS.belongsTo('arrangement', { async: true }),
});
