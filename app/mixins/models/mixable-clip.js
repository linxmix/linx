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

  prevClip: Ember.computed.reads('prevItem.clip'),
  nextClip: Ember.computed.reads('nextItem.clip'),

  prevTransition: Ember.computed.reads('prevClip.transition'),
  nextTransition: Ember.computed.reads('nextClip.transition'),

  isMixable: true,

  clipStartBeat: variableTernary(
    'prevClip.isValidTransition',
    'clipStartBeatWithTransition',
    'clipStartBeatWithoutTransition'
  ),

  clipEndBeat: variableTernary(
    'nextClip.isValidTransition',
    'clipEndBeatWithTransition',
    'clipEndBeatWithoutTransition'
  ),

  numBeatsClip: subtract('clipEndBeat', 'clipStartBeat'),

  // overlap with prevClip if is transition
  _startBeat: withDefault('prevClip.endBeat', 0),
  startBeat: variableTernary('prevClip.isValidTransition', 'prevClip.startBeat', '_startBeat'),
});
