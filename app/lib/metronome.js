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

  // returns the sequencerTime of the given beat
  beatToTime: function(beat) {
    // TODO: Dynamic BPM
    return (beat - 1) * (1 / this.get('bps'));
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

  seekToTime: function(time) {
    this.set('startTime', time);
    this.set('lastPlayTime', this.getClockTime());
  },

  scheduleAtBeat: function(playable, beat) {
    return this.scheduleAtTime(playable, this.beatToTime(beat));
  },

  scheduleAtTime: function(playable, time) {
    var delay = time - this.getCurrentTime();
    console.log("schedulingAtTime", playable, time, delay);

    if (delay > 0) {
      return clock.callbackAtTime(() => {
        // recalculate delay for accuracy
        delay = time - this.getCurrentTime();
        console.log("playing playable", playable, this.getCurrentTime(), delay);
        playable.play(this, -delay);
      }, this.getClockTime() + delay)

    // delay is negative, so play this clip forwards some time
    } else {
      playable.play(this, -delay);
    }
  },

  updateTimes: function(isPlaying) {
    if (isPlaying) {
      this.set('lastPlayTime', this.getClockTime());
    } else {
      this.set('startTime', this.getCurrentTime());
    }
    console.log("lastPlayTime", this.get('lastPlayTime'));
    console.log("startTime", this.get('startTime'));
    console.log("currentTime", this.getCurrentTime());
  },
});
