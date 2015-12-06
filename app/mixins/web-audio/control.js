import Ember from 'ember';

import RequireAttributes from 'linx/lib/require-attributes';

// Interface for controllable AudioParams on Web Audio Nodes
export default Ember.Mixin.create(
  RequireAttributes('name', 'componentName', 'defaultValue'), {

  // params
  description: null,
  value: null,
  automations: Ember.computed(() => []),

  suspendAutomation() {

  },

  isAutomationSuspended: Ember.computed({
    get(key) {
      return false;
    },
    set(key, bool) {
      if (bool) {
        this._scheduleAutomations();
      } else {
        this._cancelAutomations();
      }

      return bool;
    },
  }),

  addAutomation(automation) {
    // TODO: audioParam.setValueCurveAtTime
    this.get('automations').addObject(automation);
  },

  removeAutomation(automation) {
    this.get('automations').removeObject(automation);
  },

  _scheduleAutomations() {
    this._cancelAutomations();
    this.get('automations');
  },

  _cancelAutomations() {
    this.get('automations').map((automation) => { return automation.cancel(); });
  },
});
