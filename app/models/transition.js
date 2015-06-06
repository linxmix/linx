import Ember from 'ember';
import DS from 'ember-data';
import DependentModel from 'linx/lib/models/dependent-model';

export default DS.Model.extend(
  DependentModel('arrangement'), {

  fromTime: DS.attr('number'), // end time of fromTrack
  toTime: DS.attr('number'), // start time of toTrack

  fromTrack: DS.belongsTo('track', { async: true }),
  toTrack: DS.belongsTo('track', { async: true }),

  mixListItems: DS.hasMany('mix-list-item', { async: true }),
});
