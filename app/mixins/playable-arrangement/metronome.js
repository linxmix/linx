import Ember from 'ember';

import _ from 'npm:underscore';

import RequireAttributes from 'linx/lib/require-attributes';
import { beatToTime, timeToBeat, clamp, isNumber } from 'linx/lib/utils';
import Clock from 'linx/lib/clock';

// Holds rhythym based on clock
// TODO(REFACTOR): TODO(MULTIGRID): refactor metronome to have a beatgrid?
export default Ember.Object.extend(
  RequireAttributes('audioContext'), {

  // params
  tick: Ember.computed.reads('clock.tick'),
  seekBeat: 0,        // last seeked beat of the metronome
  absSeekTime: 0,     // [s] last seeked time of metronome in clock frame of reference
  lastPlayBeat: 0,    // beat at which metronome was last played
  bpm: 128.000,
  isPlaying: false,

  clock: Ember.computed('audioContext', function() {
    let clock = Clock.create({ audioContext: this.get('audioContext') });
    clock.start();
    return clock;
  }),

  setBpm(bpm) {
    this.seekToBeat(this.getCurrentBeat());
    this.set('bpm', bpm);
  },

  createEvent(options = {}) {
    return this.get('clock').createEvent(options);
  },

  seekToBeat(beat) {
    console.log("metronome seekToBeat", beat);
    let prevBeat = this.get('seekBeat');

    // TODO: hack to make sure to trigger property changes
    if (beat === prevBeat) {
      beat += 0.00000000001;
    }

    this.setProperties({
      seekBeat: beat,
      absSeekTime: this._getAbsTime()
    });
  },

  playpause(beat) {
    if (!this.get('isPlaying')) {
      this.play(beat);
    } else {
      this.pause();
    }
  },

  play(beat) {
    if (isNumber(beat)) {
      this.seekToBeat(beat);
    }

    // synchronously update times
    this.setProperties({
      absSeekTime: this._getAbsTime(),
      lastPlayBeat: this.get('seekBeat'),
      isPlaying: true,
    });
  },

  pause() {
    this.setProperties({
      seekBeat: this.getCurrentBeat(),
      isPlaying: false,
    });
  },

  // Returns current metronome beat
  getCurrentBeat() {
    return this.get('seekBeat') + this._getPlayedBeats();
  },

  // Returns metronome's current absolute time
  getCurrentAbsTime() {
    return this.get('absSeekTime') + this._getPlayedTime();
  },

  _getAbsTime() {
    return this.get('clock').getCurrentTime();
  },

  _getPlayedTime() {
    if (this.get('isPlaying')) {
      return this._getAbsTime() - this.get('absSeekTime');
    } else {
      return 0;
    }
  },

  _getPlayedBeats() {
    return timeToBeat(this._getPlayedTime(), this.get('bpm'));
  },

  destroy() {
    this.get('clock').destroy();
    this._super.apply(this, arguments);
  },
});
