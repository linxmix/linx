import Ember from 'ember';
import DS from 'ember-data';
import AbstractListItemMixin from 'linx/lib/models/abstract-list-item';
import _ from 'npm:underscore';

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

  createTransition: function() {
    var transition = this.get('store').createRecord('transition', {
      fromTrack: fromTrack,
      toTrack: toTrack,
    });

    return this.insertTransition(transition);
  },

  removeTransition: function() {
    this.set('transition', null);
    return this.save();
  },

  removeTrack: function() {
    return this.destroyRecord();
  },

  isValid: function() {
    var transition = this.get('transition');
    var nextTransition = this.get('nextTransition');

    var fromTracksCorrect = true;
    var toTracksCorrect = true;
    var timesCorrect = true;

    if (transition) {
      fromTracksCorrect = transition.get('fromTrack') === this.get('track');
      toTracksCorrect = transition.get('toTrack') === this.get('nextTrack');
    }

    if (nextTransition) {
      timesCorrect = transition.get('toTime') <= nextTransition.get('toTime')
    }

    return _.every([fromTracksCorrect, toTracksCorrect, timesCorrect]);
  }.property('track', 'nextTrack', 'transition.fromTrack', 'transition.toTrack', 'nextTransition'),

});
