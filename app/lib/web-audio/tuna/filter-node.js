import Ember from 'ember';

import Tuna from 'npm:tunajs';

import WebAudioNodeMixin from 'linx/mixins/web-audio/node';
import { isValidNumber } from 'linx/lib/utils';

export default Ember.ObjectProxy.extend(
  WebAudioNodeMixin, {

  // optional params
  frequency: 20,           // 20 to 22050
  Q: 1,                    // 0.001 to 100
  gain: 0,                 // -40 to 40
  filterType: 'highpass',  // lowpass, highpass, bandpass, lowshelf, highshelf, peaking, notch, allpass
  bypass: 0,

  tuna: Ember.computed('audioContext', function() {
    return new Tuna(this.get('audioContext'));
  }),

  // implement web-audio/node
  node: Ember.computed('tuna', 'frequency', 'Q', 'gain', 'filterType', 'bypass', function() {
    const tuna = this.get('tuna');
    const properties = this.getProperties('frequency', 'Q', 'gain', 'filterType', 'bypass');

    return new tuna.Filter(properties);
  }),
});
