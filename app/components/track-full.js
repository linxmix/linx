import Ember from 'ember';
import RequireAttributes from 'linx/lib/require-attributes';

const EXCLUDE_PARAMs = ['analysis_url', 'AWSAccessKeyId'];

export default Ember.Component.extend(
  RequireAttributes('track'), {

  classNames: ['track-full'],

  echonestTrack: Ember.computed.alias('track.echonestTrack'),
  analysis: Ember.computed.alias('echonestTrack.analysis'),

  displayAudioParams: function() {
    var audioParams = this.get('echonestTrack.audioParams') || [];
    return audioParams.reject(function(param) {
      return EXCLUDE_PARAMs.contains(param.key);
    })
  }.property('echonestTrack.audioParams'),

  displayBeats: function() {
    var beats = this.get('analysis.beats') || [];
    return beats.reject(function(beat) {
      // return beat.confidence < 0.5;
      return false;
    }).mapBy('start');
  }.property('analysis.beats.@each.start')
});
