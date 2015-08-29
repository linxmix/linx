import Ember from 'ember';
import DS from 'ember-data';

import ArrangementItem from './arrangement-item';
import MixListItemMixin from 'linx/mixins/models/mix-list-item';

import { isNumber } from 'linx/lib/utils';
import equalProps from 'linx/lib/computed/equal-props';

export default ArrangementItem.extend(MixListItemMixin, {
  type: 'transition-mix-item',

  transition: DS.belongsTo('transition', { async: true }),

  startBeat: subract('prevItem.endBeat', 'transition.numBeats'), // overlap
  isValid: Ember.computed.and('hasTransition', 'timesAreValid', 'fromTrackIsValid', 'toTrackIsValid'),

  hasTransition: Ember.computed.bool('transition.content'),

  expectedFromTrack: Ember.computed.reads('transition.fromTrack'),
  expectedToTrack: Ember.computed.reads('transition.toTrack'),

  actualFromTrack: Ember.computed.reads('prevItem.lastTrack'),
  actualToTrack: Ember.computed.reads('nextItem.firstTrack'),

  fromTrackIsValid: equalProps('expectedFromTrack.content', 'actualFromTrack.content'),
  toTrackIsValid: equalProps('expectedToTrack.content', 'actualToTrack.content'),

  // TODO(TRANSITION)
  timesAreValid: function() {
    var startBeat = this.get('prevClip.startBeat');
    var endBeat = this.get('prevClip.endBeatWithTransition');
    // return isNumber(startBeat) && isNumber(endBeat) && startBeat <= endBeat;
    return true;
  }.property('clipStartBeat', 'clipEndBeatWithTransition'),


  _clip: DS.belongsTo('transition-clip', { async: true }),
  clip: withDefaultModel('_clip', function() {
    return this.get('store').createRecord('transition-clip');
  }),
});
