import Ember from 'ember';
import DS from 'ember-data';
import AbstractListItemMixin from 'linx/lib/models/abstract-list-item';

// Wraps Clip models to hold arrangement information
export default DS.Model.extend(
  AbstractListItemMixin('arrangement-row'), {

  startBeat: DS.attr('number'), // starting beat in arrangement
  length: Ember.computed.alias('clip.length'), // length, in beats of the clip
  endBeat: function() {
    return this.get('startBeat') + this.get('length');
  }.property('startBeat', 'length'),

  isReady: Ember.computed.bool('clip.isReady'),
  type: Ember.computed.alias('clip.type'),

  clip: DS.belongsTo('clip', { polymorphic: true, async: true }),

  isPlaying: false,
  seekBeat: 0,
  seekTime: 0,
  playpause: function() {
    this.toggleProperty('isPlaying');
  },
  play: function(beat, time) {
    var length = this.get('length');

    if (beat > length) {
      this.set('isPlaying', false);
      beat = length;
    } else {
      this.set('isPlaying', true);
    }

    this.set('seekBeat', beat);
    this.set('seekTime', time);
  },
  pause: function() {
    this.set('isPlaying', false);
  },
});
