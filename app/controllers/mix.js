import Ember from 'ember';

export default Ember.Controller.extend({
  // expected params
  model: null,
  searchTracks: Ember.computed(() => { return []; }),
});
