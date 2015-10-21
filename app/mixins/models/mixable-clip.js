import Ember from 'ember';
import DS from 'ember-data';

import RequireAttributes from 'linx/lib/require-attributes';
import ReadinessMixin from '../readiness';

import { variableTernary } from 'linx/lib/computed/ternary';
import subtract from 'linx/lib/computed/subtract';
import withDefault from 'linx/lib/computed/with-default';

export default Ember.Mixin.create(
  ReadinessMixin('isMixableClipReady'), {

  mixItem: DS.belongsTo('mix-item', { async: true }),

  // implement readiness mixin
  isMixableClipReady: Ember.computed.bool('model.isLoaded'),

  // TODO(REQUIREPROPERTIES)
  model: null,
  firstTrack: null,
  lastTrack: null,

  prevItem: Ember.computed.reads('mixItem.prevItem'),
  nextItem: Ember.computed.reads('mixItem.nextItem'),

  prevTransition: Ember.computed.reads('prevItem.transition'),
  nextTransition: Ember.computed.reads('item.transition'),

  prevClip: Ember.computed.reads('prevItem.clip'),
  nextClip: Ember.computed.reads('nextItem.clip'),

  prevTransitionClip: Ember.computed.reads('prevItem.transitionClip'),
  nextTransitionClip: Ember.computed.reads('item.transitionClip'),

  prevTransitionIsValid: Ember.computed.reads('prevTransitionClip.isValid'),
  nextTransitionIsValid: Ember.computed.reads('nextTransitionClip.isValid'),

  clipStartBeat: variableTernary(
    'prevTransitionIsValid',
    'clipStartBeatWithTransition',
    'clipStartBeatWithoutTransition'
  ),

  clipEndBeat: variableTernary(
    'nextTransitionIsValid',
    'clipEndBeatWithTransition',
    'clipEndBeatWithoutTransition'
  ),

  numBeatsClip: subtract('clipEndBeat', 'clipStartBeat'),

  // overlap with prevClip if is transition
  _startBeat: withDefault('prevClip.endBeat', 0),
  startBeat: variableTernary('prevTransitionIsValid', 'prevTransitionClip.startBeat', '_startBeat'),
});
