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

  // params
  metronome: Ember.computed.reads('arrangement.metronome'),
  isPlaying: Ember.computed.reads('metronome.isPlaying'),
  notReady: Ember.computed.not('isReady'),
  isReady: Ember.computed.reads('arrangement.isReady'),

  zoom: Ember.computed(function() {
    return d3.behavior.zoom();
  }),

  // TODO(SVG): this is deprecated
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
});
