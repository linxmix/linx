import Ember from 'ember';

import BubbleActions from 'linx/lib/bubble-actions';

import {
  BEAT_QUANTIZATION,
} from 'linx/models/track/audio-meta/beat-grid';

import {
  CONTROL_TYPE_VOLUME,
  CONTROL_TYPE_FILTER_HIGHPASS_CUTOFF,
  CONTROL_TYPE_FILTER_LOWPASS_CUTOFF
} from 'linx/mixins/playable-arrangement/automatable-clip/control';

const AUTOMATION_OPTIONS = {
  [CONTROL_TYPE_VOLUME]: 'Volume',
  [CONTROL_TYPE_FILTER_HIGHPASS_CUTOFF]: 'Highpass',
  [CONTROL_TYPE_FILTER_LOWPASS_CUTOFF]: 'Lowpass',
};

export default Ember.Component.extend(
  BubbleActions('toggleShowAutomation'), {

  classNames: ['MixBuilderPrecisionControlsTransition'],

  // required params
  clip: null,
  selectedAutomation: null,

  // optional params
  quantizeBeat: Ember.K,
  selectAutomation: Ember.K,

  automationOptions: AUTOMATION_OPTIONS,

  actions: {
    optimizeTransition() {
      const transition = this.get('transition.content') || this.get('transition');
      transition && transition.optimize({
        startVolume: this.get('optimizeStartVolume'),
        volumeControlPointCount: this.get('optimizeControlPointCount'),
      });
    },

    snapToBeat() {
      const transitionClip = this.get('clip');
      const quantizedBeat = this.get('quantizeBeat')(transitionClip.get('endBeat'), BEAT_QUANTIZATION);
      const fromTrackClip = transitionClip.get('fromTrackClip.content');

      fromTrackClip.set('audioEndTime', fromTrackClip.getAudioTimeFromArrangementBeat(quantizedBeat));
    }
  },

  // TODO(TECHDEBT): share these with other defaults, ie models/transition
  optimizeControlPointCount: 3,
  optimizeStartVolume: 0.7,

  // params
  transition: Ember.computed.reads('clip.transition'),
});

