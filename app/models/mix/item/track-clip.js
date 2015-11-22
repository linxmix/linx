import Ember from 'ember';

import TrackClipMixin from 'linx/mixins/playable-arrangement/track-clip';
import { variableTernary } from 'linx/lib/computed/ternary';

export default Ember.Object.extend(
  TrackClipMixin, {

  track: null,

  audioStartBeat: variableTernary(
    'prevTransitionClip.isValid',
    'audioStartBeatWithTransition',
    'audioStartBeatWithoutTransition'
  ),

  audioEndBeat: variableTernary(
    'nextTransitionClip.isValid',
    'audioEndBeatWithTransition',
    'audioEndBeatWithoutTransition'
  ),

  audioStartBeatWithoutTransition: 0,
  audioEndBeatWithoutTransition: Ember.computed.reads('audioMeta.endBeat'),

  audioStartBeatWithTransition: Ember.computed.reads('prevTransition.toTrackStartBeat'),
  audioEndBeatWithTransition: Ember.computed.reads('nextTransition.fromTrackEndBeat'),

  // determines which side of the mixItem this is
  isFromTrackClip: equalProps('mixItem.transition.fromTrack.id', 'model.id'),
  isFirstClip: Ember.computed.and('mixItem.isFirstItem', 'isFromTrackClip'),
  isNotFirstClip: Ember.computed.not('isFirstClip'),

  prevItem: Ember.computed.reads('mixItem.prevItem'),
  nextItem: Ember.computed.reads('mixItem.nextItem'),

  prevTransitionClip: variableTernary(
    'isFromTrackClip',
    'prevItem.transitionClip',
    'mixItem.transitionClip'
  ),
  nextTransitionClip: variableTernary(
    'isFromTrackClip',
    'mixItem.transitionClip',
    'nextItem.transitionClip'
  ),

  prevTransition: Ember.computed.reads('prevTransitionClip.transition'),
  nextTransition: Ember.computed.reads('nextTransitionClip.transition'),
});
