import Ember from 'ember';

import RequireAttributes from 'linx/lib/require-attributes';

// Interface for Web Audio Nodes
export default Ember.Mixin.create(
  RequireAttributes('audioContext'), {
  content: Ember.computed.reads('node'),

  // params
  node: null,
  outputNode: null,

  connect(destNode, output, input) {
    let node = this.get('node');
    node && node.connect(destNode, output, input);
  },

  disconnect() {
    let node = this.get('node');
    node && node.disconnect();
  },

  destroy() {
    this.disconnect();
    return this._super.apply(this, arguments);
  },
});
