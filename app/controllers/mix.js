import Ember from 'ember';

export default Ember.Controller.extend({
  // expected params
  model: null,

  searchTracks: Ember.computed(function() {
    return this.get('store').find('track');
  }),

  // controlled by checkbox
  insertTracksWithTransitions: false,
});
