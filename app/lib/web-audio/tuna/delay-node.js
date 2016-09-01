import Ember from 'ember';

import Tuna from 'npm:tunajs';

import WebAudioNodeMixin from 'linx/mixins/web-audio/node';
import { isValidNumber } from 'linx/lib/utils';

export default Ember.ObjectProxy.extend(
  WebAudioNodeMixin, {

  // optional params
  feedback: 0.7,      // 0 to 1+
  delayTime: 150,     // how many milliseconds should the wet signal be delayed?
  wetLevel: 0,        // 0 to 1+
  dryLevel: 1,        // 0 to 1+
  cutoff: 10000,      // cutoff frequency of the built in lowpass-filter. 20 to 22050
  bypass: 1,

  tuna: Ember.computed('audioContext', function() {
    return new Tuna(this.get('audioContext'));
  }),

  // implement web-audio/node
  node: Ember.computed('tuna', 'feedback', 'delayTime', 'wetLevel', 'dryLevel', 'cutoff', 'bypass', function() {
    const tuna = this.get('tuna');
    const properties = this.getProperties('feedback', 'delayTime', 'wetLevel', 'dryLevel', 'cutoff', 'bypass');

    properties.bypass = properties.bypass ? 1 : 0;

    return new tuna.Delay(properties);
  }),
});
