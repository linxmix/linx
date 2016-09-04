import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['MixBuilderHeader'],

  // required params
  mix: null,
  mixSaveTask: null,
  mixRecordTask: null,
  saveMix: Ember.K,
  recordMix: Ember.K,
  stopRecord: Ember.K,

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

