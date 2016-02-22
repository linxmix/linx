import Ember from 'ember';

import GainNode from './gain-node';

export default GainNode.extend({

  // params
  track: null,

  // implement web-audio/node
  node: Ember.computed('audioContext', function() {
    let audioContext = this.get('audioContext');
    return audioContext.createGain();
  }),
});
