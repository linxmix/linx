import Ember from 'ember';

import Wavesurfer from 'linx/lib/wavesurfer';

import ReadinessMixin from 'linx/mixins/readiness';

// Hack: AudioPlayer is using Wavesurfer to play and control audio
export default Ember.Object.extend({
  ReadinessMixin('isAudioLoaded'), {

  isAudioLoaded: false,

  content: Ember.computed(function() {

  }),
});
