import Ember from 'ember';
import Clock from 'lib/clock';

export default Ember.Application.initializer({
  name: 'audioContext',

  initialize: function(container, application) {
    application.audioContext = this.getAudioContext();
    console.log('init audioContext', application.audioContext);
  },

  getAudioContext: function () {
    var AudioContextConstructor = (window.AudioContext || window.webkitAudioContext);
    return new AudioContextConstructor();
  },

  // TODO
  // getOfflineAudioContext: function (sampleRate) {
  //     if (!WaveSurfer.WebAudio.offlineAudioContext) {
  //         WaveSurfer.WebAudio.offlineAudioContext = new (
  //             window.OfflineAudioContext || window.webkitOfflineAudioContext
  //         )(1, 2, sampleRate);
  //     }
  //     return WaveSurfer.WebAudio.offlineAudioContext;
  // },
});
