import Ember from 'ember';
import DS from 'ember-data';

// Wraps Clip models to hold arrangement information
export default DS.Model.extend({
  start: DS.attr('number'),

  arrangementRow: DS.belongsTo('arrangement-row'),

  clip: DS.belongsTo('abstract-clip', { polymorphic: true, async: true }),
});
