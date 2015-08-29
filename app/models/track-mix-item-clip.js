import Ember from 'ember';
import DS from 'ember-data';
import AudioClip from './audio-clip';
import TransitionableClipMixin from 'linx/mixins/models/transitionable-clip';

export default AudioClip.extend(TransitionableClipMixin, {
  type: 'track-mix-item-clip',

  startBeatWithoutTransition: Ember.computed.reads('track.audioMeta.firstBeat'),
  endBeatWithoutTransition: Ember.computed.reads('track.audioMeta.lastBeat'),

  startBeatWithTransition: Ember.computed.reads('arrangementItem.prevItem.transition.toTrackStartBeat'),
  endBeatWithTransition: Ember.computed.reads('arrangementItem.nextItem.transition.fromTrackEndBeat'),

  track: Ember.computed.reads('arrangementItem.track'),
});
