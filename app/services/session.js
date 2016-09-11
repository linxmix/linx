import Ember from 'ember';

export default Ember.Service.extend({
  store: Ember.inject.service(),

  audioContext: Ember.computed(function() {
    // TODO: error handle for unsupported browsers
    const AudioContext = (window.AudioContext || window.webkitAudioContext);
    return new AudioContext();
  }),

  offlineAudioContext: Ember.computed('audioContext', function() {
    const audioContext = this.get('audioContext');
    // TODO: error handle for unsupported browsers
    const OfflineAudioContext = (window.OfflineAudioContext || window.webkitOfflineAudioContext);

    return new OfflineAudioContext(1, 2, audioContext.sampleRate);
  }),

  getCurrentTime: function() {
    return this.get('audioContext').currentTime;
  },

  willDestroy() {
    this.get('audioContext').close();
    return this._super.apply(this, arguments);
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

    // return store && store.createRecord('mix');
  }),
});
