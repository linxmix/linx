import Ember from 'ember';

import RequireAttributes from 'linx/lib/require-attributes';

// Interface for chains of Web Audio Nodes
export default Ember.Mixin.create({

  // params
  inputNode: null,
  outputNode: null,
  nodes: null,

  controls: Ember.computed('nodes.@each.controls', function() {
    return flatten(this.get('nodes').mapBy('controls'));
  }),

  getControl(controlName) {
    return this.get('controls').findBy('name', controlName);
  },

  destroyNodes() {
    this.get('nodes').map((node) => { return node.destroy(); });
  },

  destroy() {
    this.destroyNodes();
    return this._super.apply(this, arguments);
  }
});
