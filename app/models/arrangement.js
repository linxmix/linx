import Ember from 'ember';
import DS from 'ember-data';

export default DS.Model.extend({
  title: DS.attr('string'),

  rows: DS.hasMany('arrangement-row'),
  mix: DS.belongsTo('mix'),
});
