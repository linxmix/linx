import Ember from 'ember';
import DS from 'ember-data';

import ENV from 'linx/config/environment';

export default Track.extend({
  title: DS.attr('string'),
  artist: DS.attr('string'),
  length: DS.attr('number'),

  md5: DS.attr('string'),
  s3Url: DS.attr('string'),

  streamUrl: Ember.computed.or('s3StreamUrl', 'scStreamUrl'),

  scStreamUrl: function() {
    return soundcloud.stream_url + '?client_id=' + clientId;
    return null;
  }.property(),
});
