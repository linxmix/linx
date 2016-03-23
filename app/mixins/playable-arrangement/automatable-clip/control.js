import Ember from 'ember';

import { isValidNumber } from 'linx/lib/utils';

export const CONTROL_TYPE_GAIN = 'gain';

export const CONTROL_TYPES = [
  CONTROL_TYPE_GAIN
];

// Interface for Automatable Controls
// provides setValueCurveAtTime
// audioParamPath is a path to a Web Audio AudioParam
export default function(audioParamPath) {
  return Ember.Mixin.create({
    audioParamPath,

    // required params
    clip: null,
    type: '',

    // optional params
    description: '',
    isSuspended: false,
    value: null,
    defaultValue: null,

    audioParam: Ember.computed.reads(`clip.${audioParamPath}`),
    automations: Ember.computed(() => Ember.Map.create()),

    addAutomation(automation, params = {}) {
      const automations = this.get('automations');
      const isNewAutomation = !automations.has(automation);

      automations.set(automation, params);

      // if adding a new automation, schedule it.
      if (isNewAutomation) {
        // Ember.Logger.log('add new automation', params);
        this.setValueCurveAtTime(params);


      // NOTE: web audio api audio params cannot cancel individual automations.
      //       so to update automations, we must cancel and reschedule them all
      } else {
        // Ember.Logger.log('update existing automation', params);
        Ember.run.once(this, 'rescheduleAutomations');
      }
    },

    removeAutomation(automation) {
      const automations = this.get('automations');
      if (automations.delete(automation)) {
        Ember.run.once(this, 'rescheduleAutomations');
      }
    },

    rescheduleAutomations() {
      this.cancelAutomations();
      this.scheduleAutomations();
    },

    scheduleAutomations() {
      const automations = this.get('automations');
      automations.forEach((params) => {
        this.setValueCurveAtTime(params);
      });
    },

    // TODO(PERFORMANCE): only cancel values that havent occurred yet
    cancelAutomations: Ember.on('willDestroy', function() {
      const audioParam = this.get('audioParam');
      audioParam && audioParam.cancelScheduledValues(0);
    }),

    setValueCurveAtTime({ values, startTime, duration }) {
      Ember.assert('Must provide values as Float32Array to Control.setValueCurveAtTime',
        values instanceof Float32Array);
      Ember.assert('Must provide valid values, startTime, and duration to Control.setValueCurveAtTime',
        !Ember.isEmpty(values) && isValidNumber(startTime) && isValidNumber(duration));

      const audioParam = this.get('audioParam');
      audioParam && audioParam.setValueCurveAtTime(values, startTime, duration);
    },
  });
}
