import Ember from 'ember';

export default Ember.Service.extend({
  audioContext: function() {
    // TODO: error handle for unsupported browsers
    var AudioContext = (window.AudioContext || window.webkitAudioContext);
    return new AudioContext();
  }.property(),

  getCurrentTime: function() {
    return this.get('audioContext').currentTime;
  }
});

// TODO
// getOfflineAudioContext: function (sampleRate) {
//     if (!WaveSurfer.WebAudio.offlineAudioContext) {
//         WaveSurfer.WebAudio.offlineAudioContext = new (
//             window.OfflineAudioContext || window.webkitOfflineAudioContext
//         )(1, 2, sampleRate);
//     }
//     return WaveSurfer.WebAudio.offlineAudioContext;
// },
