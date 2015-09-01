import Ember from 'ember';
import DS from 'ember-data';

import ArrangementClip from './arrangement-clip';

import { isNumber } from 'linx/lib/utils';
import equalProps from 'linx/lib/computed/equal-props';
import subtract from 'linx/lib/computed/subtract';

export default ArrangementClip.extend({
  // type: 'transition-clip',

  // implementing mixableClip
  model: DS.belongsTo('transition', { async: true }),
  isTransitionable: false,

  // implementing Clip
  startBeat: subtract('prevClip.endBeat', 'transition.numBeats'), // overlap
  isValid: Ember.computed.and('hasTransition', 'timesAreValid', 'fromTrackIsValid', 'toTrackIsValid'),

  // implementing arrangementClip
  nestedArrangement: Ember.computed.reads('transition.arrangement'),

  // transition-clip specific
  // TODO(TRANSITION)
  transition: Ember.computed.alias('model'),
  fromClip: Ember.computed.reads('prevClip'),
  toClip: Ember.computed.reads('nextClip'),

  isValidTransition: Ember.computed.reads('isValid'),
  hasTransition: Ember.computed.bool('transition.content'),

  expectedFromTrack: Ember.computed.reads('transition.fromTrack'),
  expectedToTrack: Ember.computed.reads('transition.toTrack'),

  actualFromTrack: Ember.computed.reads('prevClip.lastTrack'),
  actualToTrack: Ember.computed.reads('nextClip.firstTrack'),

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
