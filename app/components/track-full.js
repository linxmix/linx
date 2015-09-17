import Ember from 'ember';
import RequireAttributes from 'linx/lib/require-attributes';

const EXCLUDE_PARAMs = ['analysis_url', 'AWSAccessKeyId'];

export default Ember.Component.extend(
  RequireAttributes('track', 'clip'), {

  classNames: ['TrackFull'],

  echonestTrack: Ember.computed.reads('track.echonestTrack'),
  analysis: Ember.computed.reads('echonestTrack.analysis'),

  actions: {
    playpause: function() {
      this.toggleProperty('isPlaying');
    },

    queueTrack(track) {
      this.get('session').queueTrack(track);
    },

    analyzeTrack(track) {
      track.fetchAudioMeta();
    }
  },

  session: Ember.inject.service(),

  displayAudioParams: function() {
    var audioParams = this.get('echonestTrack.audioParams') || [];
    return audioParams.reject(function(param) {
      return EXCLUDE_PARAMs.contains(param.key);
    });
  }.property('echonestTrack.audioParams'),

  // TODO: remove hack
  seekBeat: 0,
  pxPerBeat: 15,
  isPlaying: false,
});
