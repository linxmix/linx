import Ember from 'ember';
import DS from 'ember-data';

export default DS.Model.extend({
  fromTime: DS.attr('number'), // end time of fromTrack
  toTime: DS.attr('number'), // start time of toTrack

  fromTrack: DS.belongsTo('track'),
  arrangement: DS.belongsTo('arrangement'),
  toTrack: DS.belongsTo('track'),
});
