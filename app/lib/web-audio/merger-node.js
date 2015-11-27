import Ember from 'ember';

import ReadinessMixin from 'linx/mixins/readiness';
import WebAudioNodeMixin from 'linx/mixins/web-audio/node';
import { isNumber } from 'linx/lib/utils';

const MERGER_NODE_INPUTS = 10;

export default Ember.Object.extend(
  WebAudioNodeMixin,
  ReadinessMixin('isAudioLoaded'), {

  // params
  // TODO(REFACTOR): make this not static?
  numberOfInputs: MERGER_NODE_INPUTS,

  // implement web-audio/node
  node: Ember.computed('audioContext', 'numberOfInputs', function() {
    let audioContext = this.get('audioContext');
    return audioContext.createChannelMerger(this.get('numberOfInputs'));
  }),
});
