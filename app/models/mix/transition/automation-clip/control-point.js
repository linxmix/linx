import Ember from 'ember';
import DS from 'ember-data';

import ArrangementAutomationClipControlPoint from 'linx/models/arrangement/automation-clip/control-point';

export default ArrangementAutomationClipControlPoint.extend({
  // overrides
  automationClip: DS.belongsTo('mix/transition/automation-clip'),
});
