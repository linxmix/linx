import Ember from 'ember';

import _ from 'npm:underscore';
import d3 from 'd3';

import RequireAttributes from 'linx/lib/require-attributes';

// Interface for controlling Playable Arrangements
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

  // TODO(REFACTOR): does pxPerBeat make sense?
  pxPerBeat: 20,
  zoom: Ember.computed(function() {
    return d3.behavior.zoom();
  }),

  // params
  metronome: Ember.computed.reads('arrangement.metronome'),
  isPlaying: Ember.computed.reads('metronome.isPlaying'),
  notReady: Ember.computed.not('isReady'),
  isReady: Ember.computed.reads('arrangement.isReady'),
});
