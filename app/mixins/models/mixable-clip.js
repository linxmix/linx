import Ember from 'ember';
import DS from 'ember-data';

import RequireAttributes from 'linx/lib/require-attributes';
import ReadinessMixin from '../readiness';

import { variableTernary } from 'linx/lib/computed/ternary';
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

  prevItem: Ember.computed.reads('mixItem.prevItem'),
  nextItem: Ember.computed.reads('mixItem.nextItem'),

  prevTransition: Ember.computed.reads('prevItem.transition'),
  nextTransition: Ember.computed.reads('item.transition'),

  prevClip: Ember.computed.reads('prevItem.clip'),
  nextClip: Ember.computed.reads('nextItem.clip'),

  prevTransitionClip: Ember.computed.reads('prevItem.transitionClip'),
  nextTransitionClip: Ember.computed.reads('item.transitionClip'),

  prevTransitionClipIsValid: Ember.computed.reads('prevTransitionClip.isValid'),
  nextTransitionIsValid: Ember.computed.reads('nextTransitionClip.isValid'),

  audioStartBeat: variableTernary(
    'prevTransitionClipIsValid',
    'audioStartBeatWithTransition',
    'audioStartBeatWithoutTransition'
  ),
  audioStartBar: multiply('audioStartBeat', 0.25),

  audioEndBeat: variableTernary(
    'nextTransitionIsValid',
    'audioEndBeatWithTransition',
    'audioEndBeatWithoutTransition'
  ),
  audioEndBar: multiply('audioEndBeat', 0.25),

  audioNumBeats: subtract('audioEndBeat', 'audioStartBeat'),
  audioNumBars: multiply('audioNumBeats', 0.25),
  numBeats: Ember.computed.reads('audioNumBeats'),
  numBars: Ember.computed.reads('audioNumBars'),

  startBeat: withDefault('prevTransitionClip.startBeat', 0),
});
