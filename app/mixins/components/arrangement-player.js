import Ember from 'ember';

import _ from 'npm:underscore';

import RequireAttributes from 'linx/lib/require-attributes';
import Metronome from './playable-arrangement/metronome';

// Interface for controlling Playable Arrangements
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
  notReady: Ember.computed.not('isReady'),
  isReady: Ember.computed.reads('arrangement.isReady'),

  session: Ember.inject.service(),
  audioContext: Ember.computed.reads('session.audioContext'),

  // metronome: Ember.computed.reads('arrangement.metronome'),
  metronome: Ember.computed('audioContext', function() {
    return Metronome.create({ audioContext: this.get('audioContext') });
  }),

  // TODO(REFACTOR): manage arr FX chain here. connect to speakers, expose sinkNode
  // speakers is audioContext.destination

  // TODO(REFACTOR): move view logic out of player? to make it so player is not tied to component
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

  destroy() {
    this.get('metronome').destroy();
    return this._super.apply(this, arguments);
  },
});
