import Ember from 'ember';
import DS from 'ember-data';
import AbstractClip from './abstract-clip';

// Clip that automates a control
export default AbstractClip.extend({
  start: DS.attr('number'),
  end: DS.attr('number'),
  type: 'automation-clip',
});
