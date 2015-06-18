import Ember from 'ember';
import RequireAttributes from 'linx/lib/require-attributes';

// Holds rhythym based on global clock
export default Ember.Object.extend(
  RequireAttributes('clock'), {

  playpause: function() {
    var isPlaying = !this.get('isPlaying');
    this.updateTimes(isPlaying);
    this.set('isPlaying', isPlaying);
  },

  // params
  lastPlayTime: 0, // in context's frame of reference
  startTime: 0, // in context's frame of reference
  isPlaying: false,
  bpm: 128.000, // TODO: Dynamic BPM

  bps: function() {
    return this.get('bpm') / 60.0;
  }.property('bpm'),

  spb: function() {
    return 1 / this.get('bps');
  }.property('bps'),

  // returns the sequencerTime of the given beat
  beatToTime: function(beat) {
    // TODO: Dynamic BPM
    return beat * (1 / this.get('bps'));
  },

  // returns the sequencerBeat of the given time
  timeToBeat: function(time) {
    // TODO: Dynamic BPM
    return 1 + (time * this.get('bps'));
  },

  getClockTime: function() {
    return this.get('clock.audioContext.currentTime');
  },

  getPlayedTime: function() {
    return this.getClockTime() - this.get('lastPlayTime');
  },

  getCurrentTime: function() {
    return this.get('startTime') + this.getPlayedTime();
  },

  getCurrentBeat: function() {
    return this.timeToBeat(this.getCurrentTime());
  },

  seekToTime: function(time) {
    this.set('startTime', time);
    this.set('lastPlayTime', this.getClockTime());
  },

  seekToBeat: function(beat) {
    this.seekToTime(this.beatToTime(beat));
  },

  scheduleAtBeat: function(cb, beat) {
    return this.scheduleAtTime(cb, this.beatToTime(beat));
  },

  scheduleAtTime: function(cb, time) {
    Ember.assert('ScheduleAtTime called with cb and time',
      Ember.typeOf(time) === 'number',
      Ember.typeOf(cb) === 'function');

    var delay = time - this.getCurrentTime();
    console.log("schedulingAtTime", time, delay);

    if (delay > 0) {
      return this.get('clock').callbackAtTime(() => {
        // recalculate delay for accuracy
        delay = this.getCurrentTime() - time;
        cb(this.timeToBeat(delay), delay);
      }, this.getClockTime() + delay)

    // delay is negative, so play this clip forwards some time
    } else {
      cb(this.timeToBeat(-delay), -delay);
    }
  },

  updateTimes: function(isPlaying) {
    if (isPlaying) {
      this.set('lastPlayTime', this.getClockTime());
    } else {
      this.set('startTime', this.getCurrentTime());
    }
    // console.log("metronome lastPlayTime", this.get('lastPlayTime'));
    // console.log("metronome startTime", this.get('startTime'));
    console.log("metronome currentTime", this.getCurrentTime());
  },
});
