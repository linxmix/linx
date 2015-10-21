import Ember from 'ember';
import DS from 'ember-data';

import ArrangementClip from './arrangement-clip';

import { isNumber } from 'linx/lib/utils';
import equalProps from 'linx/lib/computed/equal-props';
import subtract from 'linx/lib/computed/subtract';

export default ArrangementClip.extend({
  mixItem: DS.belongsTo('mix-item', { async: true }),

  // implementing Clip
  startBeat: subtract('fromClip.endBeat', 'numBeats'), // overlap
  numBeats: Ember.computed.reads('transition.numBeats'),
  isValid: Ember.computed.and('hasTransition', 'timesAreValid', 'fromTrackIsValid', 'toTrackIsValid'),

  // implementing arrangementClip
  nestedArrangement: Ember.computed.reads('transition.arrangement'),

  // transition-clip specific
  model: DS.belongsTo('transition', { async: true }),
  transition: Ember.computed.reads('model'),

  prevItem: Ember.computed.reads('mixItem.prevItem'),
  nextItem: Ember.computed.reads('mixItem.nextItem'),

  fromClip: Ember.computed.reads('mixItem.clip'),
  toClip: Ember.computed.reads('nextItem.clip'),

  hasTransition: Ember.computed.bool('transition.content'),

  expectedFromTrack: Ember.computed.reads('transition.fromTrack'),
  expectedToTrack: Ember.computed.reads('transition.toTrack'),

  actualFromTrack: Ember.computed.reads('fromClip.lastTrack'),
  actualToTrack: Ember.computed.reads('toClip.firstTrack'),

  fromTrackIsValid: equalProps('expectedFromTrack.content', 'actualFromTrack.content'),
  toTrackIsValid: equalProps('expectedToTrack.content', 'actualToTrack.content'),

  // TODO(TRANSITION)
  timesAreValid: function() {
    var startBeat = this.get('fromClip.startBeat');
    var endBeat = this.get('fromClip.endBeatWithTransition');
    // return isNumber(startBeat) && isNumber(endBeat) && startBeat <= endBeat;
    return true;
  }.property('clipStartBeat', 'clipEndBeatWithTransition'),
});
