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
  seekBeat: 0,        // last seeked beat of the metronome
  absSeekTime: 0,     // [s] last seeked time of metronome in clock frame of reference
  lastPlayBeat: 0,    // beat at which metronome was last played
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

  seekToBeat(beat, silent = false) {
    console.log("metronome seekToBeat", beat);
    let prevBeat = this.get('seekBeat');

    // TODO: hack to make sure to trigger property changes
    // if (beat === prevBeat) {
    //   beat += 0.00000000001;
    // }

    this.setProperties({
      seekBeat: beat,
      absSeekTime: this._getAbsTime()
    });
    this.trigger('seek');

    if (this.get('isPlaying')) {
      this.trigger('schedule');
    }
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

    if (!this.get('isPlaying')) {
      // synchronously update times
      this.setProperties({
        absSeekTime: this._getAbsTime(),
        lastPlayBeat: this.get('seekBeat'),
        isPlaying: true,
      });
      this.trigger('play');
      this.trigger('schedule');
    }
  },

  pause() {
    if (!this.get('isPaused')) {
      this.setProperties({
        seekBeat: this.getCurrentBeat(),
        isPlaying: false,
      });
      this.trigger('pause');
      this.trigger('unschedule');
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
