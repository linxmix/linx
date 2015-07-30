import Ember from 'ember';
import DS from 'ember-data';

// Base clip model,
export default DS.Model.extend({
  arrangementItem: DS.belongsTo('arrangement-item', { async: true }),

  play: function(metronome, time) {
    throw new Error('Must implement clip.play');
  },

  pause: function() {
    throw new Error('Must implement clip.pause');
  },

  type: function() {
    throw new Error('Must implement computed property: clip.type');
  }.property(),

  lengthBeats: function() {
    throw new Error('Must implement computed property: clip.lengthBeats');
  }.property(),

  isReady: function() {
    throw new Error('Must implement computed property: clip.isReady');
  }.property(),
});
