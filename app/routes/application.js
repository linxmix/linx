import Ember from 'ember';

export default Ember.Route.extend({

  model: function() {

    // Test
    new Worker('assets/workers/file-decoder.js');

    return Ember.RSVP.hash({
      tracks: null,
      metronome: null,
    });
  }
});
