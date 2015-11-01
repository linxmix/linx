import Ember from 'ember';
import DS from 'ember-data';

import ArrangementClip from './arrangement-clip';

import { isNumber } from 'linx/lib/utils';
import equalProps from 'linx/lib/computed/equal-props';
import subtract from 'linx/lib/computed/subtract';

export default ArrangementClip.extend({
  transition: DS.belongsTo('transition', { async: true }),

  // implementing Clip
  startBeat: subtract('fromTrackClip.endBeat', 'numBeats'), // overlap
  numBeats: Ember.computed.reads('transition.numBeats'),

  // implementing arrangementClip
  nestedArrangement: Ember.computed.reads('transition.arrangement'),

  // transition-clip specific
  // TODO(TRANSITION): what of the rest is necessary?
  isValid: Ember.computed.and('hasTransition', 'timesAreValid'),
  // isValid: Ember.computed.and('hasTransition', 'timesAreValid', 'fromTrackIsValid', 'toTrackIsValid'),

  fromTrackClip: Ember.computed.reads('mixItem.fromTrackClip'),
  toTrackClip: Ember.computed.reads('mixItem.toTrackClip'),

  hasTransition: Ember.computed.bool('transition.id'),

  expectedFromTrack: Ember.computed.reads('transition.fromTrack'),
  expectedToTrack: Ember.computed.reads('transition.toTrack'),

  actualFromTrack: Ember.computed.reads('fromTrackClip.lastTrack'),
  actualToTrack: Ember.computed.reads('toTrackClip.firstTrack'),

  fromTrackIsValid: equalProps('expectedFromTrack.id', 'actualFromTrack.id'),
  toTrackIsValid: equalProps('expectedToTrack.id', 'actualToTrack.id'),

  // TODO(TRANSITION)
  timesAreValid: function() {
    var startBeat = this.get('fromTrackClip.startBeat');
    var endBeat = this.get('fromTrackClip.endBeatWithTransition');
    // return isNumber(startBeat) && isNumber(endBeat) && startBeat <= endBeat;
    return true;
  }.property('clipStartBeat', 'clipEndBeatWithTransition'),
});
