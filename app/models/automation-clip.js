import Ember from 'ember';
import DS from 'ember-data';
import Clip from './clip';

// Clip that automates a control
export default Clip.extend({
  start: DS.attr('number'),
  end: DS.attr('number'),
  type: 'automation-clip',
});
