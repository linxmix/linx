import Ember from 'ember';

import RequireAttributes from 'linx/lib/require-attributes';

import { isValidNumber } from 'linx/lib/utils';

export const CONTROL_TYPE_GAIN = 'gain';

export const CONTROL_TYPES = [
  CONTROL_TYPE_GAIN
];

// Interface for Automatable Controls
// provides setValueCurveAtTime
// audioParamPath is a path to a Web Audio AudioParam
export default function(audioParamPath) {
  return Ember.Mixin.create(
    RequireAttributes('clip'), {

    audioParamPath,

    // required params
    clip: null,
    type: '',

    // optional params
    description: '',
    isSuspended: false,

    _initClipListeners: Ember.on('init', function() {
      const clip = this.get('clip');
      clip && clip.on('schedule', this, this.updateValue);
      clip && clip.on('unschedule', this, this.updateValue);
    }),

    _removeClipListeners: Ember.on('willDestroy', function() {
      const clip = this.get('clip');
      clip && clip.off('schedule', this, this.updateValue);
      clip && clip.off('unschedule', this, this.updateValue);
    }),

    // on seek, update underlying web audio param to current value
    updateValue() {
      const currentTime = this.get('clip').getAbsoluteTime();
      const automationsHash = this.get('automations');

      // TODO:
      // if currentTime in automation, leave as it
      // if currentTime outside automation, set value to last value of most recently finished automation
      let firstValue, lastValue;
      const autom
      automationsHash.forEach((automation) => {

      });
    },

    audioParam: Ember.computed.reads(`clip.${audioParamPath}`),
    automations: Ember.computed(() => Ember.Map.create()),

    timeSort: ['startTime:asc'],
    timeSortedAutomations: Ember.computed.sort('automations', 'timeSort'),


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
