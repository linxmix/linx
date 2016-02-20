import Ember from 'ember';
import DS from 'ember-data';

import ReadinessMixin from 'linx/mixins/readiness';
import RequireAttributes from 'linx/lib/require-attributes';
import ArrangementClipMixin from 'linx/mixins/playable-arrangement/arrangement-clip';
import { isNumber } from 'linx/lib/utils';
import subtract from 'linx/lib/computed/subtract';
import { propertyOrDefault } from 'linx/lib/computed/ternary';

export default Ember.Object.extend(
  ArrangementClipMixin,
  ReadinessMixin('isTransitionClipReady'),
  RequireAttributes('mixItem'), {

  // implementing Clip
  _startBeat: subtract('fromTrackClip.endBeat', 'beatCount'), // overlap
  startBeat: propertyOrDefault('isReadyAndValid', '_startBeat', 0),
  arrangement: Ember.computed.reads('mixItem.mix'),

  // implementing arrangement-clip
  nestedArrangement: Ember.computed.reads('transition'),

  // implementing readiness
  isTransitionClipReady: Ember.computed.reads('transition.isReady'),

  // params
  transition: Ember.computed.reads('mixItem.transition'),
  hasTransition: Ember.computed.bool('transition.id'),
  fromTrackClip: Ember.computed.reads('mixItem.fromTrackClip'),
  toTrackClip: Ember.computed.reads('mixItem.toTrackClip'),

  isValid: Ember.computed.and('hasTransition', 'timesAreValid'),
  isReadyAndValid: Ember.computed.and('isValid', 'isReady'),

  // TODO(TRANSITION)
  timesAreValid: function() {
    // var startBeat = this.get('fromTrackClip.startBeat');
    // var endBeat = this.get('fromTrackClip.endBeatWithTransition');
    // return isNumber(startBeat) && isNumber(endBeat) && startBeat <= endBeat;
    return true;
  }.property('clipStartBeat', 'clipEndBeatWithTransition'),
});
