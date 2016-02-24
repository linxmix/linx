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

    setValueCurveAtTime(values, startTime, duration) {
      Ember.assert('Must provide values as Float32Array to Control.setValueCurveAtTime',
        values instanceof Float32Array);
      Ember.assert('Must provide valid values, startTime, and duration to Control.setValueCurveAtTime',
        !Ember.isEmpty(values) && isValidNumber(startTime) && isValidNumber(duration));

      const audioParam = this.get('audioParam');
      // console.log('setValueCurveAtTime', audioParam, values, startTime, duration)
      audioParam && audioParam.setValueCurveAtTime(values, startTime, duration);
    },

    // TODO(PERFORMANCE): only cancel values that havent occurred yet?
    cancelAutomations() {
      const audioParam = this.get('audioParam');
      audioParam && audioParam.cancelScheduledValues(0);
    },
  });
}
