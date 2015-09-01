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
  isPlaying: Ember.computed.alias('metronome.isPlaying'),
  session: Ember.inject.service(),
  pxPerBeat: 15,

  metronome: function() {
    var audioContext = this.get('session.audioContext');
    if (audioContext) {
      return Metronome.create({ audioContext: audioContext });
    }
  }.property('session.audioContext'),

  // TODO: why do computed props not work here?
  notReady: Ember.computed.not('isReady'),
  readyClips: function() {
    return this.getWithDefault('_arrangementItems', []).filterBy('isReady');
  }.property('_arrangementItems.@each.isReady'),
  isReady: function() {
    return this.get('_arrangementItems.length') === this.get('readyClips.length');
  }.property('_arrangementItems.[]', 'readyClips.[]'),

});
