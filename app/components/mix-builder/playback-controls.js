import Ember from 'ember';

import _ from 'npm:underscore';

import { isValidNumber } from 'linx/lib/utils';

export default Ember.Component.extend({
  classNames: ['MixBuilderPlaybackControls'],

  // required params
  mix: null,

  updateMixBpm: _.throttle(function(newBpm) {
    newBpm = parseFloat(newBpm);

    if (isValidNumber(newBpm)) {
      this.set('mix.bpm', newBpm);
    }
  }, 1000, { leading: false }),
});

