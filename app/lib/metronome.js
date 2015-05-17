import Ember from 'ember';

export const PLAY_STATES = ['PAUSE', 'PLAY'];

export default Ember.Object.extend({

  // expected params
  bpm: 128.000,
  numBeats: null,

  // timers
  beat: 1,
  bar: 1,

  position: 0,

  secondsPerBeat: function() {
    return this.get('bpm') 
  }.property('bpm'),

  beat: function() {

  }.property('bpm', 'numBeats'),

  play: function(time) {
    // TODO: schedule periodic update against App.clock and seconds per beat
    var clock = App.clock;
    var secondsPerBeat = this.get('secondsPerBeat');
  },

  pause: function() {
    // TODO: unschedule periodic update based on App.clock
  },

  stop: function() {
    this.pause();
    this.set('beat', 0);
  },

  update: function(beat) {
    // TODO
    this.set('bar', (beat / 4);
    this.set('minutes', minutesFormat);
    this.set('seconds', secondsFormat);
  },
});
