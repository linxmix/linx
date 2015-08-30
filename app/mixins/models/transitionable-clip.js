import Ember from 'ember';
import DS from 'ember-data';

import RequireAttributes from 'linx/lib/require-attributes';

import { variableTernary } from 'linx/lib/computed/ternary';
import subtract from 'linx/lib/computed/subtract';
import withDefault from 'linx/lib/computed/with-default';

export default Ember.Mixin.create({
  // TODO(REQUIREPROPERTIES)
  // RequireAttributes('startBeatWithTransition', 'startBeatWithoutTransition', 'endBeatWithTransition', 'endBeatWithoutTransition'), {

  prevEvent: Ember.computed.reads('arrangementEvent.prevEvent'),
  nextEvent: Ember.computed.reads('arrangementEvent.nextEvent'),

  prevTransition: Ember.computed.reads('prevEvent.transition'),
  nextTransition: Ember.computed.reads('nextEvent.transition'),

  isTransitionable: true,

  startBeat: variableTernary(
    'prevEvent.isValidTransition',
    'startBeatWithTransition',
    'startBeatWithoutTransition'
  ),

  endBeat: variableTernary(
    'nextEvent.isValidTransition',
    'endBeatWithTransition',
    'endBeatWithoutTransition'
  ),

  numBeats: subtract('endBeat', 'startBeat'),
});
