import Ember from 'ember';

import RequireAttributes from 'linx/lib/require-attributes';

// Interface for Web Audio Nodes
export default Ember.Mixin.create(
  RequireAttributes('audioContext'), {

  // params
  content: Ember.computed.reads('node'),
  node: null,
  outputNode: null,
  controls: Ember.computed(() => []),

  getControl(controlName) {
    return this.get('controls').findBy('name', controlName);
  },

  connectOutput: Ember.observer('node', 'outputNode.content', function() {
    let node = this.get('node');
    let outputNode = this.get('outputNode.content');

    if (node && outputNode) {
      node.connect(outputNode);
    }
  }),

  disconnect() {
    let node = this.get('node');
    node && node.disconnect();
  },

  destroy() {
    this.disconnect();
    return this._super.apply(this, arguments);
  },
});
