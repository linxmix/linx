import Ember from 'ember';
import DS from 'ember-data';

import RequireAttributes from 'linx/lib/require-attributes';
import ReadinessMixin from '../readiness';

import { variableTernary, propertyOrDefault } from 'linx/lib/computed/ternary';
import equalProps from 'linx/lib/computed/equal-props';
import subtract from 'linx/lib/computed/subtract';
import multiply from 'linx/lib/computed/multiply';
import withDefault from 'linx/lib/computed/with-default';

export default Ember.Mixin.create(
  ReadinessMixin('isMixableClipReady'), {

  mixItem: DS.belongsTo('mix/item', { async: true }),

  // implement readiness mixin
  isMixableClipReady: Ember.computed.bool('model.isLoaded'),

  // TODO(REQUIREPROPERTIES)
  model: null,
  firstTrack: null,
  lastTrack: null,
  audioStartBeatWithTransition: null,
  audioEndBeatWithTransition: null,
  audioStartBeatWithoutTransition: null,
  audioEndBeatWithoutTransition: null,

  // determines which side of the mixItem this is
  isFromTrackClip: equalProps('mixItem.transition.fromTrack.id', 'model.id'),

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

  audioStartBeat: variableTernary(
    'prevTransitionClip.isValid',
    'audioStartBeatWithTransition',
    'audioStartBeatWithoutTransition'
  ),
  audioStartBar: multiply('audioStartBeat', 0.25),

  audioEndBeat: variableTernary(
    'nextTransitionClip.isValid',
    'audioEndBeatWithTransition',
    'audioEndBeatWithoutTransition'
  ),
  audioEndBar: multiply('audioEndBeat', 0.25),

  audioNumBeats: subtract('audioEndBeat', 'audioStartBeat'),
  audioNumBars: multiply('audioNumBeats', 0.25),
  numBeats: Ember.computed.reads('audioNumBeats'),
  numBars: Ember.computed.reads('audioNumBars'),

  startBeatInMix: propertyOrDefault('isNotFirstClip', 'prevTransitionClip.startBeat', 0),
  isFirstClip: Ember.computed.and('mixItem.isFirstItem', 'isFromTrackClip'),
  isNotFirstClip: Ember.computed.not('isFirstClip'),
});
