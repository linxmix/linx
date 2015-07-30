import Ember from 'ember';
import DS from 'ember-data';
import withDefaultModel from 'linx/lib/computed/with-default-model';

export default DS.Model.extend({
  fromTime: DS.attr('number'), // end time of fromTrack
  toTime: DS.attr('number'), // start time of toTrack

  fromTrack: DS.belongsTo('track', { async: true }),
  toTrack: DS.belongsTo('track', { async: true }),

  template: DS.belongsTo('arrangement', { async: true }),
  clips: DS.hasMany('transition-clip', { async: true }),
});
