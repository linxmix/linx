import Ember from 'ember';

import RequireAttributes from 'linx/lib/require-attributes';

// Interface for Web Audio Nodes
export default Ember.Mixin.create(
  RequireAttributes('audioContext'), {

  // params
  content: Ember.computed.reads('node'),
  node: null,
  outputNode: null,
  isConnected: false,
  controls: Ember.computed(() => []),

  getControl(controlName) {
    return this.get('controls').findBy('name', controlName);
  },

  connectOutput: Ember.observer('node', 'outputNode', function() {
    let node = this.get('node');
    let outputNode = this.get('outputNode');

    if (node && outputNode) {
      node.connect(outputNode);
      this.set('isConnected', true);
    }
  }).on('init'),

  disconnect() {
    let node = this.get('node');
    node && node.disconnect();
    this.set('isConnected', false);
  },

  willDestroy() {
    this.disconnect();
    return this._super.apply(this, arguments);
  },

  toString() {
    return '<linx@mixin:web-audio/node>';
  },
});
