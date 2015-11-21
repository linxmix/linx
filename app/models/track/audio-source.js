import Ember from 'ember';

// TODO(DKANE)
export default Ember.Object.extend({
  // optional params
  streamUrl: null,
  proxyStreamUrl: null,
  arrayBuffer: null,
  file: null,

  // params
  file: null,

  // TODO: compact URL and AudioSource stuff into TrackAudioSource.create({ track: this })
  // TODO: add tests for track.audioSource
  audioSource: Ember.computed('streamUrl', 'proxyStreamUrl', 'file', function() {
    return AudioSource.create({
      streamUrl: this.get('streamUrl'),
      proxyStreamUrl: this.get('proxyStreamUrl'),
      // arrayBuffer: this.get('soundcloudTrack.audioArrayBuffer'),
      file: this.get('file'),
    });
  }),

  streamUrl: Ember.computed.or('s3StreamUrl', 'scStreamUrl', 'soundcloudTrack.streamUrl'),
  proxyStreamUrl: Ember.computed('streamUrl', function() {
    return `/${this.get('_streamUrl')}`;
  }),

  s3StreamUrl: function() {
    if (!Ember.isNone(this.get('s3Url'))) {
      // TODO: move to s3 service
      return "http://s3-us-west-2.amazonaws.com/linx-music/" + this.get('s3Url');
    }
  }.property('s3Url'),

});
