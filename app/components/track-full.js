import Ember from 'ember';
import RequireAttributes from 'linx/lib/require-attributes';

const EXCLUDE_PARAMs = ['analysis_url', 'AWSAccessKeyId'];

export default Ember.Component.extend(
  RequireAttributes('track', 'clip'), {

  classNames: ['TrackFull'],

  echonestTrack: Ember.computed.alias('track.echonestTrack'),
  analysis: Ember.computed.alias('echonestTrack.analysis'),

  actions: {
    playpause: function() {
      this.toggleProperty('isPlaying');
    }
  },

  displayAudioParams: function() {
    var audioParams = this.get('echonestTrack.audioParams') || [];
    return audioParams.reject(function(param) {
      return EXCLUDE_PARAMs.contains(param.key);
    })
  }.property('echonestTrack.audioParams'),

  // TODO: remove hack
  seekBeat: 0,
  pxPerBeat: 15,
  isPlaying: false,
});
