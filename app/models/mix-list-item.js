import Ember from 'ember';
import DS from 'ember-data';
import AbstractListItemMixin from 'linx/lib/models/abstract-list-item';
import _ from 'npm:underscore';
import { isNumber } from 'linx/lib/utils';

export default DS.Model.extend(
  AbstractListItemMixin('mix'), {

  mix: Ember.computed.alias('list'),

  track: DS.belongsTo('track', { async: true }),
  transition: DS.belongsTo('transition', { async: true }),

  nextTrack: Ember.computed.alias('nextItem.track'),
  nextTransition: Ember.computed.alias('nextItem.transition'),

  insertTrack: function() {
    this.set('track', track);
    return this.save();
  },

  insertTransition: function() {
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
      return prevItem.get('transition.toTrackStartBeat');;
    } else {
      return 0;
    }
  }.property('prevItem.hasValidTransition', 'prevItem.transition.toTrackStartBeat'),

  // calculate ending beat of this item's track, based on nextItem.transition
  trackEndBeat: function() {
    var nextItem = this.get('nextItem');
    if (nextItem && nextItem.get('hasValidTransition')) {
      return nextItem.get('transition.toTrackStartBeat');;
    } else {
      return this.get('track.audioMeta.lastBeatMarker');
    }
  }.property('nextItem.hasValidTransition', 'nextItem.transition.toTrackStartBeat'),

  trackLengthBeats: function() {
    return this.get('trackEndBeat') - this.get('trackStartBeat');
  }.property('trackEndBeat', 'trackStartBeat'),

  hasValidTransition: function() {
    var transition = this.get('transition');
    var hasTransition = !!transition;

    var timesAreValid = true;
    var fromTracksAreValid = true;
    var toTracksAreValid = true;

    if (hasTransition) {
      fromTracksAreValid = transition.get('fromTrack') === this.get('track');
      toTracksAreValid = transition.get('toTrack') === this.get('nextTrack');
    }

    // TODO(TRANSITION)
    // if (nextTransition && nextTransition.get('hasValidTransition')) {
      // timesAreValid = this.get('prevTransitionBeat')
    // }

    return _.every([hasTransition, timesAreValid, fromTracksCorrect, toTracksCorrect]);
  }.property('track', 'nextTrack', 'transition.fromTrack', 'transition.toTrack'),
});
