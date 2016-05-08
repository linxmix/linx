import Ember from 'ember';
import DS from 'ember-data';

import MixTransitionAutomationClipControlPoint from '../automation-clip/control-point';

export default MixTransitionAutomationClipControlPoint.extend({
  // overrides
  automationClip: DS.belongsTo('mix/transition/from-track-automation-clip'),
});
