import Ember from 'ember';

import _ from 'npm:underscore';

import RequireAttributes from 'linx/lib/require-attributes';
import { beatToTime, timeToBeat, clamp, isNumber } from 'linx/lib/utils';
import Clock from 'linx/lib/clock';

// Holds rhythym based on clock
// TODO(REFACTOR): TODO(MULTIGRID): refactor metronome to have a beatgrid?
export default Ember.Object.extend(
  Ember.Evented,
  RequireAttributes('audioContext'), {

  // params
  seekBeat: 0,        // [b] last seeked beat
  absSeekTime: 0,     // [s] time of last seek in clock frame of reference
  lastPlayBeat: 0,    // [b] beat at which metronome was last played
  bpm: 128.000,
  isPlaying: false,

  // clock: Ember.computed('audioContext', function() {
  //   let clock = Clock.create({ audioContext: this.get('audioContext') });
  //   clock.start();
  //   return clock;
  // }),

  setBpm(bpm) {
    this.seekToBeat(this.getCurrentBeat());
    this.set('bpm', bpm);
  },

  // createEvent(options = {}) {
  //   return this.get('clock').createEvent(options);
  // },

  seekToBeat(beat) {
    console.log("metronome seekToBeat", beat);

    this.setProperties({
      seekBeat: beat,
      absSeekTime: this._getAbsTime()
    });
    this.trigger('seek');
  },

  playpause(beat) {
    if (!this.get('isPlaying')) {
      this.play(beat);
    } else {
      this.pause();
    }
  },

  play(beat) {
    beat = isNumber(beat) ? beat : this.getCurrentBeat();
    this.seekToBeat(beat);

    if (!this.get('isPlaying')) {
      this.setProperties({
        lastPlayBeat: this.get('seekBeat'),
        isPlaying: true,
      });
      this.trigger('play');
    }
  },

  pause() {
    if (!this.get('isPaused')) {
      this.setProperties({
        seekBeat: this.getCurrentBeat(),
        isPlaying: false,
      });
      this.trigger('pause');
    }
  },

  // TODO(REFACTOR): turn into beatgrid
  // returns absolute time at which given beat will occur in audioContext
  beatToTime(beat) {
    beat -= this.getCurrentBeat();
    return this._getAbsTime() + beatToTime(beat, this.get('bpm'));
  },

  // Returns current metronome beat
  getCurrentBeat() {
    return this.get('seekBeat') + this._getPlayedBeats();
  },

  _getAbsTime() {
    return this.get('audioContext').currentTime;
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
    // this.get('clock').destroy();
    this._super.apply(this, arguments);
  },
});
