import Ember from 'ember';
import DS from 'ember-data';

import MixTransitionAutomationClip from './automation-clip';
import { CONTROL_TYPE_TEMPO } from 'linx/mixins/playable-arrangement/automatable-clip/control';

export default MixTransitionAutomationClip.extend({

  // overrides
  targetClip: Ember.computed.reads('transition.toTrackClip'),
  controlType: CONTROL_TYPE_TEMPO,
  startBeat: 0,
  endBeat: Ember.computed.reads('transition.beatCount'),

  // map the transition's bpmScale onto track grid
  // TODO(TRACKMULTIGRID): audioBpm not constant
  scale: null, // compute off mixBpmScale, divide by audioBpm

  startValue: 0, // compute off startBeat, scale
  endValue: 0, // compute off endBeat, scale


  transitionBpmScale: null,
});
