import Ember from 'ember';

import RequireAttributes from 'linx/lib/require-attributes';

import { isValidNumber } from 'linx/lib/utils';

export const CONTROL_TYPE_GAIN = 'gain';
export const CONTROL_TYPE_BPM = 'bpm';
export const CONTROL_TYPE_PITCH = 'pitch';

export const CONTROL_TYPES = [
  CONTROL_TYPE_GAIN,
  CONTROL_TYPE_BPM,
  CONTROL_TYPE_PITCH
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
      clip && clip.on('schedule', this, this.scheduleDidChange);
      clip && clip.on('unschedule', this, this.scheduleDidChange);
    }),

    _removeClipListeners: Ember.on('willDestroy', function() {
      const clip = this.get('clip');
      clip && clip.off('schedule', this, this.scheduleDidChange);
      clip && clip.off('unschedule', this, this.scheduleDidChange);
    }),

    scheduleDidChange() {
      Ember.run.next(this, 'updateValue');
    },

    // on seek, update underlying web audio param to current value
    updateValue() {
      const currentTime = this.get('clip').getAbsoluteTime();
      const automationsHash = this.get('automations');
      const audioParam = this.get('audioParam');

      if (!isValidNumber(currentTime) || Ember.isNone(audioParam)) {
        return;
      }

      // tuples of [time, value]
      let lastEndTime = [-Infinity, NaN], nextStartTime = [Infinity, NaN], isInAutomation = false;
      automationsHash.forEach(({ values, startTime, duration }) => {
        const endTime = startTime + duration;

        // current automation
        if ((startTime <= currentTime) && (currentTime <= endTime)) {
          isInAutomation = true;

        // upcoming automation
        } else if (startTime > currentTime) {
          // possibly update nextStartTime
          if (startTime < nextStartTime[0]) {
            nextStartTime = [startTime, values[0]];
          }

        // completed automation
        } else if (endTime < currentTime) {
          // possibly update lastEndTime
          if (endTime > lastEndTime[0]) {
            lastEndTime = [endTime, values[values.length - 1]];
          }
        }
      });

      // if in automation, do not update value
      // if last value set by automation, use that
      // if no last value, use next value set by automation
      // Ember.Logger.log('updateValue', this.get('clip.track.title'), isInAutomation, lastEndTime, nextStartTime);
      if (!isInAutomation) {
        let value;

        if (isValidNumber(lastEndTime[1])) {
          value = lastEndTime[1];
        } else if (isValidNumber(nextStartTime[1])) {
          value = nextStartTime[1];
        }

        this.setValue(value);
      }
    },

    setValue(value) {
      const audioParam = this.get('audioParam');

      Ember.Logger.log('setValue', audioParam, value);
      if (audioParam && isValidNumber(value)) {
        audioParam.value = value;
      }
    },

    getValue() {
      const audioParam = this.get('audioParam');

      if (audioParam) {
        return audioParam.value;
      }
    },

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
