import Ember from 'ember';
import DS from 'ember-data';

import ArrangementClip from './arrangement-clip';
import TransitionableClipMixin from 'linx/mixins/models/transitionable-clip';

import subtract from 'linx/lib/computed/subtract';

export default ArrangementClip.extend(TransitionableClipMixin, {
  type: 'mix-clip',

  // implementing transitionableClip
  firstTrack: Ember.computed.reads('firstTrackClip.track'),
  lastTrack: Ember.computed.reads('lastTrackClip.track'),

  clipStartBeatWithoutTransition: 0,
  clipEndBeatWithoutTransition: Ember.computed.reads('numBeats'),

  clipStartBeatWithTransition: Ember.computed.reads('prevTransition.toTrackStartBeat'),
  clipEndBeatWithTransition: subtract('numBeats', '_endBeatDelta'),

  // implementing arrangementClip
  nestedArrangement: Ember.computed.reads('mix.arrangement'),

  // mix-clip specific
  mix: DS.belongsTo('mix', { async: true }),
  firstTrackClip: Ember.computed.reads('nestedArrangement.validClips.firstObject'),
  lastTrackClip: Ember.computed.reads('nestedArrangement.validClips.lastObject'),
  _endBeatDelta: subtract('lastTrackClip.endBeat', 'nextTransition.fromTrackEndBeat'),
});
