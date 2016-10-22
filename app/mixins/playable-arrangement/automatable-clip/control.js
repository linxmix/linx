import Ember from 'ember';

import d3 from 'd3';

import RequireAttributes from 'linx/lib/require-attributes';

import { isValidNumber } from 'linx/lib/utils';

export const CONTROL_TYPE_VOLUME = 'gain';
export const CONTROL_TYPE_LOW_BAND = 'low-band';
export const CONTROL_TYPE_MID_BAND = 'mid-band';
export const CONTROL_TYPE_HIGH_BAND = 'high-band';
export const CONTROL_TYPE_BPM = 'bpm';
export const CONTROL_TYPE_PITCH = 'pitch';
export const CONTROL_TYPE_DELAY_WET = 'delay-wet';
export const CONTROL_TYPE_DELAY_CUTOFF = 'delay-cutoff';
export const CONTROL_TYPE_FILTER_HIGHPASS_CUTOFF = 'filter-highpass-cutoff';
export const CONTROL_TYPE_FILTER_LOWPASS_CUTOFF = 'filter-lowpass-cutoff';

export const CONTROL_TYPES = [
  CONTROL_TYPE_VOLUME,
  CONTROL_TYPE_BPM,
  CONTROL_TYPE_PITCH,
  CONTROL_TYPE_DELAY_WET,
  CONTROL_TYPE_DELAY_CUTOFF,
  CONTROL_TYPE_FILTER_HIGHPASS_CUTOFF,
  CONTROL_TYPE_FILTER_LOWPASS_CUTOFF,
  CONTROL_TYPE_LOW_BAND,
  CONTROL_TYPE_MID_BAND,
  CONTROL_TYPE_HIGH_BAND
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
    // isSuspended: false,
    defaultValue: 0,

    // TODO(TECHDEBT): share more cleanly
    valueScale: Ember.computed('type', function() {
      switch (this.get('type')) {
        case CONTROL_TYPE_DELAY_CUTOFF:
        case CONTROL_TYPE_FILTER_HIGHPASS_CUTOFF:
        case CONTROL_TYPE_FILTER_LOWPASS_CUTOFF:
          return d3.scale.log().domain([20, 22050]).range([0, 1]);
        case CONTROL_TYPE_LOW_BAND:
        case CONTROL_TYPE_MID_BAND:
        case CONTROL_TYPE_HIGH_BAND:
          return d3.scale.linear().domain([-40, 40]).range([0, 1]);
        default:
          return d3.scale.identity();
      }
    }),

    _initClipListeners: Ember.on('init', function() {
      const clip = this.get('clip');
      clip && clip.on('schedule', this, this.scheduleDidChange);
      clip && clip.on('unschedule', this, this.scheduleDidChange);
    }),

    willDestroy() {
      const clip = this.get('clip');
      clip && clip.off('schedule', this, this.scheduleDidChange);
      clip && clip.off('unschedule', this, this.scheduleDidChange);

      return this._super.apply(this, arguments);
    },

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
        let value = this.get('defaultValue');

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

      // Ember.Logger.log('setValue', audioParam, value);
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
      if (!(values instanceof Float32Array &&
        isValidNumber(startTime) &&
        isValidNumber(duration)
      )) {
        Ember.Logger.warn('Must provide valid values, startTime, and duration to Control.setValueCurveAtTime',
          values, startTime, duration);
        return;
      }

      const audioParam = this.get('audioParam');

      try {
        audioParam && audioParam.setValueCurveAtTime(values, startTime, duration);
      } catch(e) {
        Ember.Logger.warn('Error with Control.setValueCurveAtTime', e);
      }
    },
  });
}
