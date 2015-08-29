import Ember from 'ember';
import DS from 'ember-data';
import RequireAttributes from 'linx/lib/require-attributes';

// Base clip model,
export default DS.Model.extend(
  RequireAttributes('numBeats', 'isReady', 'type') {

  arrangementItem: DS.belongsTo('arrangement-item', { async: true }),

  play: function(metronome, time) {
    throw new Error('Must implement clip.play');
  },

  pause: function() {
    throw new Error('Must implement clip.pause');
  }
});
