import Ember from 'ember';
import DS from 'ember-data';
import AbstractListItemMixin from 'linx/lib/models/abstract-list-item';
import _ from 'npm:underscore';
import { isNumber } from 'linx/lib/utils';

export default DS.Model.extend(
  AbstractListItemMixin('mix'), {

  mix: DS.belongsTo('mix', { async: true }),

  prevTransition: Ember.computed.alias('prevItem.transition'),
  track: DS.belongsTo('track', { async: true }),
  transition: DS.belongsTo('transition', { async: true }),
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

  transitionLengthBeats: Ember.computed.alias('transition.lengthBeats'),

  // calculate starting beat of this item's track, based on prevItem.transition
  trackStartBeat: function() {
    var prevItem = this.get('prevItem');
    if (prevItem && prevItem.get('hasValidTransition')) {
      return this.get('prevTransition.toTrackStartBeat');;
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

  trackLengthBeats: function() {
    return this.get('trackEndBeat') - this.get('trackStartBeat');
  }.property('trackEndBeat', 'trackStartBeat'),

  hasTransition: Ember.computed.bool('transition.content'),
  fromTrackIsValid: Ember.computed.equal('track.content', 'transition.fromTrack.content'),
  toTrackIsValid: Ember.computed.equal('transition.toTrack.content', 'nextTrack.content'),

  timesAreValid: function() {
    var startBeat = this.get('trackStartBeat');
    var endBeat = this.get('transition.fromTrackEndBeat');
    return isNumber(startBeat) && isNumber(endBeat) && startBeat <= endBeat;
  }.property('trackStartBeat', 'transition.fromTrackEndBeat'),

  hasValidTransition: Ember.computed.and('hasTransition', 'fromTrackIsValid', 'toTrackIsValid', 'timesAreValid')
});
