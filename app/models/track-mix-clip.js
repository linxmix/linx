import Ember from 'ember';
import DS from 'ember-data';

import TrackClip from './track-clip';
import TransitionableClipMixin from 'linx/mixins/models/transitionable-clip';

export default TrackClip.extend(TransitionableClipMixin, {
  type: 'track-mix-clip',
  arrangementEvent: DS.belongsTo('track-mix-event', { async: true }),

  startBeatWithoutTransition: Ember.computed.reads('track.audioMeta.firstBeat'),
  endBeatWithoutTransition: Ember.computed.reads('track.audioMeta.lastBeat'),

  startBeatWithTransition: Ember.computed.reads('prevTransition.toTrackStartBeat'),
  endBeatWithTransition: Ember.computed.reads('nextTransition.fromTrackEndBeat'),
});
