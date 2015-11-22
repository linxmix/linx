import Ember from 'ember';
import DS from 'ember-data';

export default DS.Model.extend({
  title: DS.attr('string'),
  genre: DS.attr('string'),
  description: DS.attr('string'),
  duration: DS.attr('number'),

  isStreamable: Ember.computed.reads('streamable'),
  streamable: DS.attr('boolean'),
  streamUrl: DS.attr('string'),
});
