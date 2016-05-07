import Ember from 'ember';

import _ from 'npm:underscore';

import RequireAttributes from 'linx/lib/require-attributes';
import { beatToTime, timeToBeat, clamp, isNumber, isValidNumber } from 'linx/lib/utils';
import Clock from 'linx/lib/clock';

// Holds rhythym based on clock
// TODO(REFACTOR): TODO(MULTIGRID): refactor metronome to have a beatgrid?
export default Ember.Object.extend(
  Ember.Evented, {

  // required params
  audioContext: null,
  arrangement: null,

  // params
  seekBeat: 0,        // [b] last seeked beat
  absSeekTime: 0,     // [s] time of last seek in clock frame of reference
  lastPlayBeat: 0,    // [b] beat at which metronome was last played
  bpm: 128.0,
  isPlaying: false,

  // clock: Ember.computed('audioContext', function() {
  //   let clock = Clock.create({ audioContext: this.get('audioContext') });
  //   clock.start();
  //   return clock;
  // }),

  // // returns WAAclock event
  // callbackAtTime(callback, time) {
  //   if (!isValidNumber(time)) {
  //     Ember.Logger.warn('Must call metronome.callbackAtTime with valid time', time);
  //     return;
  //   }

  //   const clock = this.get('clock');
  //   return clock && clock.callbackAtTime(callback, time);
  // },

  // createEvent(options = {}) {
  //   return this.get('clock').createEvent(options);
  // },

  // returns WAAclock event
  // callbackAtBeat(callback, beat) {
  //   return this.callbackAtTime(callback, this.beatToTime(beat));
  // },

  // TODO(V2): clean this up
  _updateBpm: Ember.observer('arrangement.bpm', function() {
    const bpm = this.get('arrangement.bpm');

    if (isValidNumber(bpm)) {
      this.seekToBeat(this.getCurrentBeat());
      this.set('bpm', bpm);
    }
  }).on('init'),

  // TODO(MULTIRGID) TODO(REFACTOR)
  getDuration(startBeat, beatCount) {
    return beatToTime(beatCount, this.get('bpm'));
  },

  seekToBeat(beat) {
    // Ember.Logger.log("metronome seekToBeat", beat);

    this.setProperties({
      seekBeat: beat,
      absSeekTime: this.getAbsTime()
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

  // TODO(MULTIGRID): turn into beatgrid
  // returns absolute time at which given beat will occur in audioContext
  beatToTime(beat) {
    beat -= this.getCurrentBeat();

    return this.getAbsTime() + beatToTime(beat, this.get('bpm'));
  },

  // Returns current metronome beat
  getCurrentBeat() {
    return this.get('seekBeat') + this._getPlayedBeats();
  },

  getAbsTime() {
    return this.get('audioContext.currentTime');
  },

  _getPlayedTime() {
    if (this.get('isPlaying')) {
      return this.getAbsTime() - this.get('absSeekTime');
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
