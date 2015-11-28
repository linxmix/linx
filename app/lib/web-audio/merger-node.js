import Ember from 'ember';

import WebAudioNodeMixin from 'linx/mixins/web-audio/node';

const MERGER_NODE_INPUTS = 10;

export default Ember.ObjectProxy.extend(
  WebAudioNodeMixin, {

  // params
  // TODO(REFACTOR): make this not static?
  numberOfInputs: MERGER_NODE_INPUTS,

  // implement web-audio/node
  node: Ember.computed('audioContext', 'numberOfInputs', function() {
    let audioContext = this.get('audioContext');
    return audioContext.createChannelMerger(this.get('numberOfInputs'));
  }),
});
