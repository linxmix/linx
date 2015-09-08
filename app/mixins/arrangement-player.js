import Ember from 'ember';
import Metronome from 'linx/lib/metronome';
import RequireAttributes from 'linx/lib/require-attributes';
import _ from 'npm:underscore';

// exposes metronome, isPlaying, isReady and playback actions
// pass metronome to clips for registering
export default Ember.Mixin.create(
  RequireAttributes('arrangement'), {

  actions: {
    playpause: function() {
      this.get('metronome').playpause();
    },

    skipBack: function() {
      this.get('metronome').seekToBeat(0);
    },

    skipForth: function() {
      console.log("skip forth unimplemented");
    },

    seekToBeat: function(beat) {
      this.get('metronome').seekToBeat(beat);
    }
  },

  // params
  isPlaying: Ember.computed.reads('metronome.isPlaying'),
  session: Ember.inject.service(),
  pxPerBeat: 5,

  metronome: function() {
    var audioContext = this.get('session.audioContext');
    if (audioContext) {
      return Metronome.create({ audioContext: audioContext });
    }
  }.property('session.audioContext'),

  notReady: Ember.computed.not('isReady'),
  isReady: Ember.computed.reads('arrangement.isReady'),

});
