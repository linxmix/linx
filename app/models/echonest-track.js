import DS from 'ember-data';

export default DS.Model.extend({
  title: DS.attr('string'),
  artist: DS.attr('string'),
  audio_summary: DS.attr(),

  song: DS.belongsTo('echonest-song', { async: true }),

  // injected by app
  echonest: null,

  // params
  analysisUrl: Ember.computed.alias('audio_summary.analysis_url'),
  analysis: function() {
    if (this.get('analysisUrl')) {
      return this.get('echonest').fetchAnalysis(this);
    }
  }.property('analysisUrl'),

  bucket: [
    'audio_summary',
  ],
});
