import Ember from 'ember';

export default {
  name: 'audio-context',

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
};
