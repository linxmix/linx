import Ember from 'ember';
import WaaClock from 'npm:waaclock';

export default {
  name: 'AudioContext',

  initialize: function(container, app) {
    var AudioContext = this.getAudioContext();

    app.register("audioContext:main", AudioContext);
    app.inject("component:wave-surfer", "audioContext", "audioContext:main");
  },

  getAudioContext: function() {
    var WaaContext = (window.AudioContext || window.webkitAudioContext);

    var waaContext = new WaaContext();

    return Ember.Object.extend({
      clock: Ember.computed(function() { return new WaaClock(waaContext); }),
      context: waaContext,
      // offlineContext: 
    });
  },
};


// TODO
// getOfflineAudioContext: function (sampleRate) {
//     if (!WaveSurfer.WebAudio.offlineAudioContext) {
//         WaveSurfer.WebAudio.offlineAudioContext = new (
//             window.OfflineAudioContext || window.webkitOfflineAudioContext
//         )(1, 2, sampleRate);
//     }
//     return WaveSurfer.WebAudio.offlineAudioContext;
// },
