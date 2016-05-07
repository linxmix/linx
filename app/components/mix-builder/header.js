import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['MixBuilderHeader'],

  // required params
  mix: null,

  actions: {
    saveMix() {
      this.get('mix').save();
    }
  },

  // params
  store: Ember.inject.service(),
  searchTracks: Ember.computed(function() {
    return this.get('store').findAll('track');
  }),
});

