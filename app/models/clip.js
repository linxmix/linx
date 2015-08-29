import Ember from 'ember';
import DS from 'ember-data';

import RequireAttributes from 'linx/lib/require-attributes';

export default DS.Model.extend(
  RequireAttributes('numBeats', 'isReady', 'type'), {

  arrangementEvent: DS.belongsTo('arrangement-event', { async: true, polymorphic: true }),

  play: function(metronome, time) {
    throw new Error('Must implement clip.play');
  },

  pause: function() {
    throw new Error('Must implement clip.pause');
  }
});
