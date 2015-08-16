import Ember from 'ember';

export default Ember.Service.extend({
  store: Ember.inject.service(),

  audioContext: function() {
    // TODO: error handle for unsupported browsers
    var AudioContext = (window.AudioContext || window.webkitAudioContext);
    return new AudioContext();
  }.property(),

  getCurrentTime: function() {
    return this.get('audioContext').currentTime;
  },

  /***
    Queue Functions
  ***/

  playTrack() {
    throw new Error('playTrack unimplemented');
  },

  queueTrack(track) {
    this.get('queue').appendTrack(track);
  },

  playTransition() {
    throw new Error('playTransition unimplemented');
  },

  queueTransition() {
    throw new Error('queueTransition unimplemented');
  },

  playMix() {
    throw new Error('playMix unimplemented');
  },

  queueMix() {
    throw new Error('queueMix unimplemented');
  },

  queue: Ember.computed('store', function () {
    var store = this.get('store');

    return store && store.createRecord('mix');
  }),
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
