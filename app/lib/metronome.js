import Ember from 'ember';
import RequireAttributes from 'linx/lib/require-attributes';

// Holds rhythym based on global clock
export default Ember.Object.extend(
  RequireAttributes('clock'), {

  isPlaying: false,
  lastPlayTime: 0,
  startTime: 0,

  // TODO: Dynamic BPM
  bpm: 128.000,
  bps: function() {
    return this.get('bpm') / 60.0;
  }.property('bpm'),

  // returns the sequencerTime of the given beat
  beatToTime: function(beat) {
    // TODO: Dynamic BPM
    return beat * (1 / this.get('bps'));
  },

  // returns the sequencerBeat of the given time
  timeToBeat: function(time) {
    // TODO: Dynamic BPM
    return time * this.get('bps');
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

  seekTo: function(time) {
    this.set('startTime', time);
    this.set('lastPlayTime', this.getClockTime());
  },

  updateTimes: function() {
    if (this.get('isPlaying')) {
      this.set('lastPlayTime', this.getClockTime());
    } else {
      this.set('startTime', this.getCurrentTime());
    }
    console.log("lastPlayTime", this.get('lastPlayTime'));
    console.log("startTime", this.get('startTime'));
  }.observes('isPlaying'),
});
