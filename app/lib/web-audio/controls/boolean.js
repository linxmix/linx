import Ember from 'ember';

import WebAudioControlMixin from 'linx/mixins/web-audio/control';

const MERGER_NODE_INPUTS = 10;

export default Ember.Object.extend(
  WebAudioControlMixin, {

  name: 'boolean'
});
