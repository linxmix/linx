import Ember from 'ember';

import RequireAttributes from 'linx/lib/require-attributes';

// Interface for Web Audio Nodes
export default Ember.Object.extend(
  RequireAttributes('session'), {

  // params
  node: null,
  session: null,
  outputNode: null,
  audioContext: Ember.computed.reads('session.audioContext'),
  offlineAudioContext: Ember.computed.reads('session.offlineAudioContext'),
  isConnected: Ember.computed.bool('outputNode'),

  connectToOutput: Ember.observer('node', 'outputNode', function() {
    let { node, outputNode } = this.getProperties('node', 'outputNode');

    if (outputNode) {
      node.connect(outputNode);
    } else {
      node.disconnect();
    }
  },

  destroy() {
    let node = this.get('node');
    node && node.disconnect();
    return this._super.apply(this, arguments);
  },
});
