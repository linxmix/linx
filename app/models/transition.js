import Ember from 'ember';
import DS from 'ember-data';

export default DS.Model.extend({

  fromTrack: DS.belongsTo('track'),
  arrangement: DS.belongsTo('arrangement'),
  toTrack: DS.belongsTo('track'),
  mixItems: DS.hasMany('mix-item'),
});
