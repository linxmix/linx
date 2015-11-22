import Ember from 'ember';
import RequireAttributes from 'linx/lib/require-attributes';
import { beatToTime, timeToBeat, clamp, isNumber } from 'linx/lib/utils';

// Holds rhythym based on clock
export default Ember.Object.extend(
  RequireAttributes('clock'), {

  // params
  tick: 0,            // computed properties should listen to metronome.tick
  seekBeat: 0,        // last seeked beat of the metronome
  absSeekTime: 0,     // [s] last seeked time of metronome in clock frame of reference
  lastPlayBeat: 0,    // beat at which metronome was last played
  bpm: 128.000,
  isPlaying: false,
  absTickTime: Ember.computed.alias('clock.tickTime'),
  tickBeat: function() {
    return this.getCurrentBeat();
  }.property('absTickTime'),

  setBpm(bpm) {
    // update seekBeat first
    this.seekToBeat(this.getCurrentBeat());
    this.set('bpm', bpm);
  },

  seekToBeat(beat) {
    console.log("metronome seekToBeat", beat);
    let prevBeat = this.get('seekBeat');

    // hack to make sure to trigger property changes
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
  getCurrentBeat: function() {
    return this.get('seekBeat') + this._getPlayedBeats();
  },

  // Returns metronome's current absolute time
  getCurrentAbsTime: function() {
    return this.get('absSeekTime') + this._getPlayedTime();
  },

  createArrangementEvent: function(clip) {
    // console.log('createArrangementEvent', clip);
    return ArrangementEvent.create({
      clip,
      metronome: this,
      clock: this.get('clock'),
    });
  },

  _getAbsTime: function() {
    return this.get('clock').getCurrentTime();
  },

  _getPlayedTime: function() {
    if (this.get('isPlaying')) {
      return this._getAbsTime() - this.get('absSeekTime');
    } else {
      return 0;
    }
  },

  _getPlayedBeats: function() {
    return timeToBeat(this._getPlayedTime(), this.get('bpm'));
  },

  destroy: function() {
    this.get('clock').destroy();
    this._super.apply(this, arguments);
  },
});
