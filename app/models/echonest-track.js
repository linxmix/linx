import DS from 'ember-data';

export default DS.Model.extend({
  title: DS.attr('string'),
  artist: DS.attr('string'),
  audio_summary: DS.attr(),

  song: DS.belongsTo('echonest-song', { async: true }),

  // injected by app
  echonest: null,

  // params
  track: Ember.computed(function() {
    return DS.PromiseObject.create({
      // TODO: can we do better? not with firebase findQuery
      promise: this.get('store').find('track').then((records) => {
        return records.filterBy('_data._echonestTrack', this.get('id')).get('firstObject');
      }),
    });
  }),
  analysisUrl: Ember.computed.alias('audio_summary.analysis_url'),
  analysis: function() {
    if (this.get('analysisUrl')) {
      return this.get('echonest').fetchAnalysis(this);
    }
  }.property('analysisUrl'),

  audioParams: function() {
    var summary = this.get('audio_summary') || {};

    return Ember.keys(summary).map((key) => {
      return {
        key: key,
        value: summary[key],
      }
    });
  }.property('audio_summary'),

  bucket: [
    'audio_summary',
  ],
});
