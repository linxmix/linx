import Ember from 'ember';
import DS from 'ember-data';

import ArrangementAutomationClipControlPoint from 'linx/models/arrangement/automation-clip/control-point';

export default ArrangementAutomationClipControlPoint.extend({
  // overrides
  automationClip: DS.belongsTo('mix/transition/automation-clip'),

  save() {
    console.log("SAVE MIX CONTROL POINT", this.get('beat'), this.get('value'));
    this._super.apply(this, arguments);

  }
});
