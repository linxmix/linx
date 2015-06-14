import Ember from 'ember';
import DS from 'ember-data';
import AbstractListItemMixin from 'linx/lib/models/abstract-list-item';

// Wraps Clip models to hold arrangement information
export default DS.Model.extend(
  AbstractListItemMixin('arrangement-row'), {

  startBeat: DS.attr('number'), // starting beat in arrangement

  type: Ember.computed.alias('clip.type'),
  isReady: Ember.computed.bool('clip.isReady'),

  // TODO: standardize method of retrieving async object from promise on fulfill?
  clip: DS.belongsTo('clip', { polymorphic: true, async: true }),

  isPlaying: false,
  seekTime: 0,
  playpause: function() {
    this.toggleProperty('isPlaying');
  },
  play: function(time) {
    this.set('isPlaying', true);
    this.set('seekTime', time);
  },
  pause: function() {
    this.set('isPlaying', false);
  },
});
