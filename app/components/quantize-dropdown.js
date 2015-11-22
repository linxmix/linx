import Ember from 'ember';
import BubbleActions from 'linx/lib/bubble-actions';
import RequireAttributes from 'linx/lib/require-attributes';

import {
  BAR_QUANTIZATION,
  BEAT_QUANTIZATION,
  TICK_QUANTIZATION,
  MS10_QUANTIZATION,
  MS1_QUANTIZATION,
  SAMPLE_QUANTIZATION,
} from 'linx/models/track/audio-meta/beat-grid';

export const QUANTIZATION_DISPLAY_VALUES = {
  [BAR_QUANTIZATION]: 'Bar',
  [BEAT_QUANTIZATION]: 'Beat',
  [TICK_QUANTIZATION]: 'Tick',
  [MS10_QUANTIZATION]: '10ms',
  [MS1_QUANTIZATION]: '1ms',
  [SAMPLE_QUANTIZATION]: 'Sample'
};

export default Ember.Component.extend(
  BubbleActions('onSelect'), RequireAttributes(), {

  actions: {},
  classNames: ['QuantizeDropdown'],
  classNameBindings: [],

  // optional params
  selected: BAR_QUANTIZATION,
  options: QUANTIZATION_DISPLAY_VALUES,
});

