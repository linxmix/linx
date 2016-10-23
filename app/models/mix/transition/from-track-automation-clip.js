import Ember from 'ember';
import DS from 'ember-data';

import MixTransitionAutomationClip from './automation-clip';

export default MixTransitionAutomationClip.extend({

  // overrides
  targetClip: Ember.computed.reads('transition.fromTrackClip'),

  orderedHasManyItemModelName: 'mix/transition/from-track-automation-clip/control-point',
  _controlPoints: DS.hasMany('mix/transition/from-track-automation-clip/control-point', { async: true }),
});
