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

  streamPromise: Ember.computed('streamUrl', 'isStreamable', function() {
    let streamUrl = this.get('streamUrl');

    if (!(this.get('isStreamable') && streamUrl)) {
      return;
    }

    return DS.PromiseObject.create({
      // TODO: convert to normal xhr because jquery doesn't support this :(
      promise: Ember.$.get(streamUrl, {
        xhrFields: {
          responseType: 'arraybuffer'
        },
      }),
    });
  }),

  audioArrayBuffer: Ember.computed.reads('streamPromise.content')

  // streamUrl: Ember.computed.or('s3StreamUrl', 'stream_url'),

  // scStreamUrl: function() {
  //   return soundcloud.stream_url + '?client_id=' + clientId;
  //   return null;
  // }.property(),
});
