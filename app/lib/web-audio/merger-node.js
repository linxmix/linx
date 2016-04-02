import Ember from 'ember';

import WebAudioNodeMixin from 'linx/mixins/web-audio/node';

const MERGER_NODE_INPUTS = 1;

export default Ember.ObjectProxy.extend(
  WebAudioNodeMixin, {

  // params
  // TODO: what is this? why does `1` work for track stereo?
  numberOfInputs: MERGER_NODE_INPUTS,

  // implement web-audio/node
  node: Ember.computed('audioContext', 'numberOfInputs', function() {
    let audioContext = this.get('audioContext');
    return audioContext.createChannelMerger(this.get('numberOfInputs'));
  }),
});
