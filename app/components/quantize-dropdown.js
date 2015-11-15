import Ember from 'ember';
import BubbleActions from 'linx/lib/bubble-actions';
import RequireAttributes from 'linx/lib/require-attributes';

export const BAR_QUANTIZATION = 'bar';
export const BEAT_QUANTIZATION = 'beat';
export const TICK_QUANTIZATION = 'tick';
export const MS10_QUANTIZATION = '10ms';
export const MS1_QUANTIZATION = '1ms';
export const SAMPLE_QUANTIZATION = 'sample';

export const QUANTIZATIONS = {
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
  options: QUANTIZATIONS,
});

