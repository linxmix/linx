import Ember from 'ember';

import { EKMixin, EKOnInsertMixin, keyDown } from 'ember-keyboard';

import BubbleActions from 'linx/lib/bubble-actions';
import { clamp, makeKeybinding } from 'linx/lib/utils';

import {
  BEAT_QUANTIZATION,
} from 'linx/models/track/audio-meta/beat-grid';

import {
  CONTROL_TYPE_VOLUME,
  CONTROL_TYPE_FILTER_HIGHPASS_CUTOFF,
  CONTROL_TYPE_FILTER_LOWPASS_CUTOFF,
  CONTROL_TYPE_DELAY_WET,
  CONTROL_TYPE_DELAY_CUTOFF,
} from 'linx/mixins/playable-arrangement/automatable-clip/control';

const AUTOMATION_OPTIONS = {
  [CONTROL_TYPE_VOLUME]: 'Volume',
  [CONTROL_TYPE_FILTER_HIGHPASS_CUTOFF]: 'Highpass',
  [CONTROL_TYPE_FILTER_LOWPASS_CUTOFF]: 'Lowpass',
  [CONTROL_TYPE_DELAY_WET]: 'Delay Wet',
  [CONTROL_TYPE_DELAY_CUTOFF]: 'Delay Cutoff'
};
const AUTOMATION_KEYS = Object.keys(AUTOMATION_OPTIONS);

export default Ember.Component.extend(
  EKMixin,
  EKOnInsertMixin,
  BubbleActions('toggleShowAutomation'), {

  classNames: ['MixBuilderPrecisionControlsTransition'],

  // required params
  clip: null,
  selectedAutomation: null,

  // optional params
  quantizeBeat: Ember.K,
  selectAutomation: Ember.K,

  automationOptions: AUTOMATION_OPTIONS,

  _selectPreviousAutomation: Ember.on(keyDown('ArrowUp'), makeKeybinding(function(e) {
    if (!this.get('clip')) { return; }

    const selectedAutomation = this.get('selectedAutomation');

    const currentIndex = AUTOMATION_KEYS.indexOf(selectedAutomation);
    const prevIndex = clamp(0, currentIndex - 1, AUTOMATION_KEYS.length);
    this.get('selectAutomation')(AUTOMATION_KEYS[prevIndex]);
  })),

  _selectNextAutomation: Ember.on(keyDown('ArrowDown'), makeKeybinding(function(e) {
    if (!this.get('clip')) { return; }

    const selectedAutomation = this.get('selectedAutomation');

    const currentIndex = AUTOMATION_KEYS.indexOf(selectedAutomation);
    const nextIndex = clamp(0, currentIndex + 1, AUTOMATION_KEYS.length);
    this.get('selectAutomation')(AUTOMATION_KEYS[nextIndex]);
  })),

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
    },

    delayBypass() {
      const fromTrackClip = this.get('clip.fromTrackClip');
      fromTrackClip && fromTrackClip.toggleProperty('delayBypass');
    },
  },

  // TODO(TECHDEBT): share these with other defaults, ie models/transition
  optimizeControlPointCount: 3,
  optimizeStartVolume: 0.7,

  // params
  transition: Ember.computed.reads('clip.transition'),
});

