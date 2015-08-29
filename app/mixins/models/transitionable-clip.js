import Ember from 'ember';
import DS from 'ember-data';

import RequireAttributes from 'linx/lib/require-attributes';

import { variableTernary } from 'linx/lib/computed/ternary';
import subtract from 'linx/lib/computed/subtract';
import withDefault from 'linx/lib/computed/with-default';

export default Ember.Mixin.create(
  RequireAttributes('startBeatWithTransition', 'startBeatWithoutTransition', 'endBeatWithTransition', 'endBeatWithoutTransition'), {

  isTransitionable: true,

  startBeat: Ember.computed.variableTernary(
    'arrangementItem.prevItemIsValidTransition',
    'startBeatWithTransition',
    'startBeatWithoutTransition'
  ),

  endBeat: Ember.computed.variableTernary(
    'arrangementItem.nextItemIsValidTransition',
    'endBeatWithTransition',
    'endBeatWithoutTransition'
  ),

  numBeats: subtract('endBeat', 'startBeat'),
});
