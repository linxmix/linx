import Ember from 'ember';

import WebAudioNodeMixin from 'linx/mixins/web-audio/node';

export default Ember.ObjectProxy.extend(
  WebAudioNodeMixin, {

  // implement web-audio/node
  node: Ember.computed('audioContext', function() {
    let audioContext = this.get('audioContext');
    return audioContext.createGain();
  }),
});
