import Ember from 'ember';

import TrackClipMixin from 'linx/mixins/playable-arrangement/track-clip';
import { variableTernary } from 'linx/lib/computed/ternary';
import withDefault from 'linx/lib/computed/with-default';

export default Ember.Object.extend(
  TrackClipMixin, {

  // params
  track: null,
  arrangement: null,
  fromTransitionClip: null,
  toTransitionClip: null,

  // implement track-clip mixin
  startBeat: withDefault('fromTransitionClip.startBeat', 0),
  audioStartBeat: variableTernary(
    'fromTransitionClip.isValid',
    'audioStartBeatWithTransition',
    'audioStartBeatWithoutTransition'
  ),
  audioEndBeat: variableTernary(
    'toTransitionClip.isValid',
    'audioEndBeatWithTransition',
    'audioEndBeatWithoutTransition'
  ),

  // TODO(TRANSITION): better defaults for these? in theory we want to snap to first and last bar
  audioStartBeatWithoutTransition: 0,
  audioEndBeatWithoutTransition: Ember.computed.reads('audioMeta.endBeat'),

  audioStartBeatWithTransition: Ember.computed.reads('prevTransition.toTrackStartBeat'),
  audioEndBeatWithTransition: Ember.computed.reads('nextTransition.fromTrackEndBeat'),

  prevTransition: Ember.computed.reads('fromTransitionClip.transition'),
  nextTransition: Ember.computed.reads('toTransitionClip.transition'),
});
