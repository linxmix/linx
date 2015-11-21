import Ember from 'ember';

// Interface for Web Audio Nodes
export default Ember.Object.extend({
  isConnected: false,

  connect() {
    throw new Error('connect unimplemented');
  },

  disconnect() {
    throw new Error('disconnect unimplemented');
  }
});
