import Ember from 'ember';

import WebAudioNodeMixin from 'linx/mixins/web-audio/node';

export default Ember.ObjectProxy.extend(
  WebAudioNodeMixin, {

  // optional params
  value: 1,

  _updateValue: Ember.observer('value', 'node', function() {
    const node = this.get('node');

    if (node) {
      node.gain.value = parseFloat(this.get('value'));
    }
  }).on('init'),

  // implement web-audio/node
  node: Ember.computed('audioContext', function() {
    let audioContext = this.get('audioContext');
    return audioContext.createGain();
  }),
});
