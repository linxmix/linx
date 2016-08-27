import Ember from 'ember';

import Tuna from 'npm:tunajs';

import WebAudioNodeMixin from 'linx/mixins/web-audio/node';
import { isValidNumber } from 'linx/lib/utils';

export default Ember.ObjectProxy.extend(
  WebAudioNodeMixin, {

  // optional params
  feedback: 0.6,    //0 to 1+
  delayTime: 150,    //how many milliseconds should the wet signal be delayed?
  wetLevel: 0,    //0 to 1+
  dryLevel: 1,       //0 to 1+
  cutoff: 10000,      //cutoff frequency of the built in lowpass-filter. 20 to 22050
  bypass: 0,

  // implement web-audio/node
  node: Ember.computed('audioContext', 'feedback', 'delayTime', 'wetLevel', 'dryLevel', 'cutoff', 'bypass', function() {
    const audioContext = this.get('audioContext');
    const tuna = new Tuna(audioContext);

    const properties = this.getProperties('feedback', 'delayTime', 'wetLevel', 'dryLevel', 'cutoff', 'bypass');
    console.log('update tuna properties', properties);

    return new tuna.Delay(properties);
  }),
});
