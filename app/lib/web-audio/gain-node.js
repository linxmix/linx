import Ember from 'ember';

import WebAudioNodeMixin from 'linx/mixins/web-audio/node';
import { isValidNumber } from 'linx/lib/utils';

export default Ember.ObjectProxy.extend(
  WebAudioNodeMixin, {

  // optional params
  value: 1,

  _updateValue: Ember.observer('value', 'node', function() {
    const node = this.get('node');
    const value = this.get('value');

    // console.log('update gain value', value, isValidNumber(value))
    if (node && isValidNumber(value)) {
      node.gain.value = value;
    }
  }).on('init'),

  // implement web-audio/node
  node: Ember.computed('audioContext', function() {
    let audioContext = this.get('audioContext');
    return audioContext.createGain();
  }),
});
