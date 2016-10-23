import Ember from 'ember';
import DS from 'ember-data';

import MixTransitionTrackTempoClip from './track-tempo-clip';

export default MixTransitionTrackTempoClip.extend({

  // overrides
  targetClip: Ember.computed.reads('transition.toTrackClip'),
});
