import Ember from 'ember';
import WaaClock from 'npm:waaclock';

export default {
  name: 'clock',

  initialize: function(container, app) {
    app.register("clock:main", Clock);

    app.inject("component:wave-surfer", "clock", "clock:main");
    app.inject("component:arrangement-player", "clock", "clock:main");
  },
};

var Clock = Ember.Object.extend({
  init: function() {
    var AudioContext = (window.AudioContext || window.webkitAudioContext);
    var audioContext = new AudioContext();
    var waaClock = new WaaClock(audioContext);

    this.setProperties({
      'audioContext': audioContext,
      'clock': waaClock
    });

    waaClock.start();
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
