import Ember from 'ember';

// controls what's playing and queued in the application
export default Ember.Service.extend({
  store: null, // added by initializer

  playTrack() {
    throw new Error('playTrack unimplemented');
  },

  queueTrack() {
    throw new Error('queueTrack unimplemented');
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

  mix: Ember.computed('store', function () {
    var store = this.get('store');

    return store && store.createRecord('mix');
  }),
});
