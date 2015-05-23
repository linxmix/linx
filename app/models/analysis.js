import Ember from 'ember';
import DS from 'ember-data';

export default DS.Model.extend({
  attr: DS.attr('string'),

  track: DS.belongsTo('track', { async: true }),
});
