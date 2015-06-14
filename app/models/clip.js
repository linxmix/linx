import Ember from 'ember';
import DS from 'ember-data';

// Base clip model
export default DS.Model.extend({

  play: function(metronome, time) {
    throw new Error('Must implement clip.play');
  },

  pause: function() {
    throw new Error('Must implement clip.pause');
  },

  type: function() {
    throw new Error('Must implement computed property: clip.type');
  }.property(),

  isReady: function() {
    throw new Error('Must implement computed property: clip.isReady');
  }.property(),

  arrangementClip: DS.hasMany('arrangement-clip', { async: true }),
});
