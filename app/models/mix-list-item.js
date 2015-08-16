import Ember from 'ember';
import DS from 'ember-data';
import AbstractListItemMixin from 'linx/lib/models/abstract-list-item';
import _ from 'npm:underscore';
import { isNumber } from 'linx/lib/utils';
import equalProps from 'linx/lib/computed/equal-props';

export default DS.Model.extend(
  AbstractListItemMixin('mix'), {

  mix: DS.belongsTo('mix', { async: true }),

  track: DS.belongsTo('track', { async: true }),
  transition: DS.belongsTo('transition', { async: true }),

  prevTransition: Ember.computed.alias('prevItem.transition'),
  nextTrack: Ember.computed.alias('nextItem.track'),

  insertTrack: function(track) {
    this.set('track', track);
    return this.save();
  },

  insertTransition: function(transition) {
    this.set('transition', transition);
    return this.save();
  },

  removeTransition: function() {
    this.set('transition', null);
    return this.save();
  },

  removeTrack: function() {
    return this.destroyRecord();
  },


  // calculate starting beat of this item's track, based on prevItem.transition
  trackStartBeat: function() {
    var prevItem = this.get('prevItem');
    if (prevItem && prevItem.get('hasValidTransition')) {
      return this.get('prevTransition.toTrackStartBeat');
    } else {
      return this.get('track.audioMeta.firstBeat');
    }
  }.property('prevItem.hasValidTransition', 'prevTransition.toTrackStartBeat', 'track.audioMeta.firstBeat'),

  // calculate ending beat of this item's track, based on item.transition
  trackEndBeat: function() {
    if (this.get('hasValidTransition')) {
      return this.get('transition.fromTrackEndBeat');
    } else {
      return this.get('track.audioMeta.lastBeat');
    }
  }.property('hasValidTransition', 'transition.fromTrackEndBeat', 'track.audioMeta.lastBeat'),

  numTrackBeats: function() {
    return this.get('trackEndBeat') - this.get('trackStartBeat');
  }.property('trackEndBeat', 'trackStartBeat'),
  numTransitionBeats: Ember.computed.alias('transition.numBeats'),

  beatParts: Ember.computed.collect('numTrackBeats', 'numTransitionBeats'),
  numBeats: Ember.computed.sum('beatParts'),

  hasTransition: Ember.computed.bool('transition.content'),
  fromTrackIsValid: equalProps('track.content', 'transition.fromTrack.content'),
  toTrackIsValid: equalProps('transition.toTrack.content', 'nextTrack.content'),

  timesAreValid: function() {
    var startBeat = this.get('trackStartBeat');
    var endBeat = this.get('transition.fromTrackEndBeat');
    return isNumber(startBeat) && isNumber(endBeat) && startBeat <= endBeat;
  }.property('trackStartBeat', 'transition.fromTrackEndBeat'),

  hasValidTransition: Ember.computed.and('hasTransition', 'fromTrackIsValid', 'toTrackIsValid', 'timesAreValid')
});
