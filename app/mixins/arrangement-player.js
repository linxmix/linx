import Ember from 'ember';
import Metronome from 'linx/lib/metronome';
import RequireAttributes from 'linx/lib/require-attributes';
import _ from 'npm:underscore';

// exposes metronome, isPlaying, isReady and playback actions
export default Ember.Mixin.create(
  RequireAttributes('arrangement'), {

  actions: {
    playpause(beat) {
      this.get('metronome').playpause(beat);
    },

    play(beat) {
      this.get('metronome').play(beat);
    },

    pause() {
      this.get('metronome').pause();
    },

    skipBack() {
      this.get('metronome').seekToBeat(0);
    },

    skipForth() {
      console.log("skip forth unimplemented");
    },

    seekToBeat(beat) {
      this.get('metronome').seekToBeat(beat);
    }
  },

  // params
  isPlaying: Ember.computed.reads('metronome.isPlaying'),
  session: Ember.inject.service(),
  pxPerBeat: 5,

  _scrollCenterBeat: 0,
  scrollCenterBeat: Ember.computed({
    get(key) {
      return this.get('_scrollCenterBeat');
    },
    set(key, beat) {
      let prevBeat = this.get('_scrollCenterBeat');

      // hack to make sure to trigger property changes
      if (beat === prevBeat) {
        beat += 0.00000000001;
      }

      this.set('_scrollCenterBeat', beat);
      return beat;
    }
  }),

  metronome: function() {
    var audioContext = this.get('session.audioContext');
    if (audioContext) {
      return Metronome.create({ audioContext: audioContext });
    }
  }.property('session.audioContext'),

  notReady: Ember.computed.not('isReady'),
  isReady: Ember.computed.reads('arrangement.isReady'),
});
