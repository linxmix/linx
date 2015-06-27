import Ember from 'ember';
import WaaClock from 'npm:waaclock';

export default {
  name: 'clock',

  initialize: function(container, app) {
    app.register("service:clock", Clock);

    app.inject("component:wave-surfer", "clock", "service:clock");
    app.inject("component:simple-transition", "clock", "service:clock");
  },
};

var Clock = Ember.Object.extend({
  init: function() {
    var AudioContext = (window.AudioContext || window.webkitAudioContext);
    var audioContext = new AudioContext();
    var waaClock = new WaaClock(audioContext);

    this.setProperties({
      'audioContext': audioContext,
      '_clock': waaClock
    });

    waaClock.start();
  },

  callbackAtTime: function(cb, time) {
    return this.get('_clock').callbackAtTime(cb, time);
  },
})

// TODO
// getOfflineAudioContext: function (sampleRate) {
//     if (!WaveSurfer.WebAudio.offlineAudioContext) {
//         WaveSurfer.WebAudio.offlineAudioContext = new (
//             window.OfflineAudioContext || window.webkitOfflineAudioContext
//         )(1, 2, sampleRate);
//     }
//     return WaveSurfer.WebAudio.offlineAudioContext;
// },
