import Ember from 'ember';
import Metronome from 'linx/lib/metronome';
import RequireAttributes from 'linx/lib/require-attributes';
import _ from 'npm:underscore';

// sequences arrangementClips as events against metronome
// wraps imperative behaviour to avoid overhead of realtime computed properties
// exposes metronome, clipEvents, isPlaying, isReady and playback actions
export default Ember.Mixin.create(
  RequireAttributes('arrangement'), {

  actions: {
    playpause: function() {
      this.get('metronome').playpause();
    },

    skipBack: function() {
      this.get('metronome').seekToTime(0);
    },

    skipForth: function() {
      console.log("skip forth unimplemented");
    },

    seekToTime: function(time) {
      this.get('metronome').seekToTime(time);
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

  notReady: Ember.computed.not('isReady'),
  readyClips: function() {
    return this.get('_arrangementClips').filterBy('isReady');
  }.property('_arrangementClips.@each.isReady'),
  isReady: function() {
    return this.get('_arrangementClips.length') === this.get('readyClips.length');
  }.property('_arrangementClips.[]', 'readyClips.[]'),

  clipEvents: Ember.computed(function() { return []; }),

  _arrangementClips: Ember.computed.oneWay('arrangement.clips'),
  _arrangementClipsWithEvents: Ember.computed.mapBy('clipEvents', 'arrangementClip'),
  _arrangementClipsWithoutEvents: Ember.computed.setDiff('_arrangementClips', '_arrangementClipsWithEvents'),
  _updateClipEvents: function() {
    var clipEvents = this.get('clipEvents');
    var metronome = this.get('metronome');

    this.get('_arrangementClipsWithoutEvents').map((clip) => {
      var clipEvent = metronome.createClipEvent(clip);
      clipEvents.pushObject(clipEvent);
    });
  }.observes('_arrangementClipsWithoutEvents.[]', 'metronome', 'clipEvents').on('init'),
});
