import Ember from 'ember';
import DS from 'ember-data';

import ArrangementEvent from './arrangement-item';
import MixEventMixin from 'linx/mixins/models/mix-event';

import { isNumber } from 'linx/lib/utils';
import equalProps from 'linx/lib/computed/equal-props';

export default ArrangementEvent.extend(MixEventMixin('transition'), {
  transition: Ember.computed.reads('clip.transition'),

  startBeat: subract('prevEvent.endBeat', 'transition.numBeats'), // overlap
  isValid: Ember.computed.and('hasTransition', 'timesAreValid', 'fromTrackIsValid', 'toTrackIsValid'),
  isValidTransition: Ember.computed.reads('isValid'),

  hasTransition: Ember.computed.bool('transition.content'),

  expectedFromTrack: Ember.computed.reads('transition.fromTrack'),
  expectedToTrack: Ember.computed.reads('transition.toTrack'),

  actualFromTrack: Ember.computed.reads('prevEvent.lastTrack'),
  actualToTrack: Ember.computed.reads('nextEvent.firstTrack'),

  fromTrackIsValid: equalProps('expectedFromTrack.content', 'actualFromTrack.content'),
  toTrackIsValid: equalProps('expectedToTrack.content', 'actualToTrack.content'),

  // TODO(TRANSITION)
  timesAreValid: function() {
    var startBeat = this.get('prevClip.startBeat');
    var endBeat = this.get('prevClip.endBeatWithTransition');
    // return isNumber(startBeat) && isNumber(endBeat) && startBeat <= endBeat;
    return true;
  }.property('clipStartBeat', 'clipEndBeatWithTransition'),
});
