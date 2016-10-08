import Ember from 'ember';

import _ from 'npm:underscore';

import RequireAttributes from 'linx/lib/require-attributes';
import { clamp, isNumber, isValidNumber } from 'linx/lib/utils';
import Clock from 'linx/lib/clock';

// Holds rhythym based on clock
export default Ember.Object.extend(
  Ember.Evented, {

  // required params
  audioContext: null,
  beatGrid: null,

  // params
  seekBeat: 0,        // [b] last seeked beat
  absSeekTime: 0,     // [s] time of last seek in clock frame of reference
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
  //   return this.callbackAtTime(callback, this.beatToAbsTime(beat));
  // },

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
        isPlaying: true,
      });
      this.trigger('play');
    }
  },

  pause() {
    if (!this.get('isPaused')) {
      this.seekToBeat(this.getCurrentBeat());
      this.setProperties({
        isPlaying: false,
      });
      this.trigger('pause');
    }
  },

  stop() {
    if (!this.get('isPaused')) {
      this.setProperties({
        isPlaying: false,
      });
      this.trigger('stop');
    }
  },

  // returns absolute time at which given beat will occur in audioContext
  beatToAbsTime(beat) {
    beat -= this.getCurrentBeat();

    return this.getAbsTime() + this.get('beatGrid').beatToTime(beat);
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
    const beatGrid = this.get('beatGrid');
    const startBeat = this.get('seekBeat');
    const startTime = beatGrid.beatToTime(startBeat);
    const endTime = startTime + this._getPlayedTime();
    return beatGrid.getBeatCount(startTime, endTime);
  },

  destroy() {
    // this.get('clock').destroy();
    this._super.apply(this, arguments);
  },
});
