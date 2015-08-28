import Ember from 'ember';
import DS from 'ember-data';
import ArrangementItem from './arrangement-item';
import AbstractListItemMixin from 'linx/lib/models/abstract-list-item';
import RequireAttributes from 'linx/lib/require-attributes';

import add from 'linx/lib/computed/add';
import subtract from 'linx/lib/computed/subtract';
import equalProps from 'linx/lib/computed/equal-props';

// Base model for arrangable items can be sequenced as a mix
export default ArrangementItem.extend(
  AbstractListItemMixin('mix'),
  RequireAttributes('type', 'tracks', 'clipStartBeatWithTransition', 'clipStartBeatWithoutTransition' 'clipEndBeatWithTransition', 'clipEndBeatWithoutTransition'), {

  type: Ember.computed(() => { return 'mix-item'; }),

  addToArrangement(arrangement) {
    throw new Error('Must implement mixItem.addToArrangement');
  },

  mix: DS.belongsTo('mix', { async: true }),
  transition: DS.belongsTo('transition', { async: true }),
  prevTransition: Ember.computed.alias('prevItem.transition'),

  numBeatsTransition: Ember.computed.reads('transition.numBeats'),
  numBeatsPrevTransition: Ember.computed.reads('prevItem.numBeatsTransition'),

  arrangementDidChange: function() {
    Ember.run.once(this, 'updateArrangement');
  }.observes('mix.arrangement', 'model', 'transition'),

  _transitionArrangementItem: DS.belongsTo('arrangement-item', { async: true }),
  transitionArrangementItem: withDefaultModel('_transitionArrangementItem', function() {
    return this.get('store').createRecord('arrangement-item');
  }),

  _arrangementItem: DS.belongsTo('arrangement-item', { async: true }),
  transitionArrangementItem: withDefaultModel('_transitionArrangementItem', function() {
    return this.get('store').createRecord('arrangement-item');
  }),

  updateArrangement() {
    this.get('mix.arrangement').then((arrangement) => {
      this.addToArrangement(arrangement);
    });
  },

  insertTransition(transition) {
    this.set('transition', transition);
    return this.save();
  },

  removeTransition() {
    this.set('transition', null);
    return this.save();
  },

  // calculate starting beat of this item in the mix's arrangement
  startBeat: function() {
    return (this.get('prevItem.endBeat') - this.get('numBeatsPrevTransition')) || 0;
  }.property('prevItem.endBeat', 'numBeatsPrevTransition'),

  endBeat: add('startBeat', 'numBeats'),
  numBeats: subtract('clipEndBeat', 'clipStartBeat'),

  // calculate starting beat of this item's clip
  clipStartBeat: function() {
    return this.get('prevItem.hasValidTransition') ?
      this.get('clipStartBeatWithTransition') :
      this.get('clipStartBeatWithoutTransition');
  }.property('prevItem.hasValidTransition', 'clipStartBeatWithTransition', 'clipStartBeatWithoutTransition'),

  clipEndBeat: function() {
    return this.get('hasValidTransition') ?
      this.get('clipEndBeatWithTransition') :
      this.get('clipEndBeatWithoutTransition');
  }.property('hasValidTransition', 'clipEndBeatWithTransition', 'clipEndBeatWithoutTransition'),

  firstTrack: Ember.computed.alias('tracks.firstObject'),
  lastTrack: Ember.computed.alias('tracks.lastObject'),

  hasTransition: Ember.computed.bool('transition.content'),

  fromTrackIsValid: equalProps('lastTrack', 'transition.fromTrack.content'),
  toTrackIsValid: equalProps('transition.toTrack.content', 'nextItem.firstTrack'),

  timesAreValid: function() {
    var startBeat = this.get('clipStartBeat');
    var endBeat = this.get('clipEndBeatWithTransition');
    return isNumber(startBeat) && isNumber(endBeat) && startBeat <= endBeat;
  }.property('clipStartBeat', 'clipEndBeatWithTransition'),

  hasValidTransition: Ember.computed.and('hasTransition', 'fromTrackIsValid', 'toTrackIsValid', 'timesAreValid')
});
