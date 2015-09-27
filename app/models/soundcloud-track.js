import Ember from 'ember';
import DS from 'ember-data';

export default DS.Model.extend({
  title: DS.attr('string'),
  genre: DS.attr('string'),
  description: DS.attr('string'),
  duration: DS.attr('number'),

  streamable: DS.attr('boolean'),
  streamUrl: DS.attr('string'),

  // streamUrl: Ember.computed.or('s3StreamUrl', 'stream_url'),

  // scStreamUrl: function() {
  //   return soundcloud.stream_url + '?client_id=' + clientId;
  //   return null;
  // }.property(),
});
