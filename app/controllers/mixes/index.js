import Ember from 'ember';

export default Ember.Controller.extend({
  // expected params
  mixes: null,
  tracks: null,

  sortedMixes: Ember.computed('mixes.@each.title', function() {
    return this.get('mixes').sortBy('title');
  }),
});
