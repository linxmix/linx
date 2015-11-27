import Ember from 'ember';

import RequireAttributes from 'linx/lib/require-attributes';

// Interface for Web Audio Nodes
export default Ember.Mixin.create(
  RequireAttributes('audioContext'), {

  // params
  node: null,

  connect(destNode, output, input) {
    let node = this.get('content');
    node && node.connect(destNode, output, input);
    // this.addDestNode(destNode);
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
