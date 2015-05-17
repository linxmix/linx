import Ember from 'ember';
import DS from 'ember-data';

// Clip that automates a control
export default DS.Model.extend({
  start: DS.attr('number'),
  end: DS.attr('number'),
  type: 'automation-clip',
});
