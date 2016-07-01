import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['MixBuilderHeader'],

  // required params
  mix: null,
  mixSaveTask: null,
  mixExportTask: null,
  saveMix: Ember.K,
  exportMix: Ember.K,

  actions: {
    saveMix() {
      this.get('saveMix')();
    },

    destroyMix() {
      this.sendAction('destroyMix');
    }
  },

  // params
  store: Ember.inject.service(),
  searchTracks: Ember.computed(function() {
    return this.get('store').findAll('track');
  }),
});

