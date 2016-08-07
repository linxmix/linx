import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['MixBuilderHeader'],

  // required params
  mix: null,
  mixExportTask: null,
  saveMix: Ember.K,
  exportMix: Ember.K,

  // optional params
  isDirty: false,
  isSaving: false,

  // params
  store: Ember.inject.service(),
  searchTracks: Ember.computed(function() {
    return this.get('store').findAll('track');
  }),
});

