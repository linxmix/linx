import Ember from 'ember';
import DS from 'ember-data';

import ArrangementAutomationClipControlPoint from 'linx/models/arrangement/automation-clip/control-point';
import { isValidNumber } from 'linx/lib/utils';

export default ArrangementAutomationClipControlPoint.extend({
  // overrides
  automationClip: DS.belongsTo('mix/transition/automation-clip'),

  deleteRecord() {
    console.log('delete control point', this.get('id'))
    return this._super.apply(this, arguments);
  },

  save() {
    if (isValidNumber(this.get('beat')) && isValidNumber(this.get('value'))) {
      console.log("save mix control point", this.get('id'));
      return this._super.apply(this, arguments);
    } else {
      return Ember.RSVP.Promise.resolve();
    }
  }
});
