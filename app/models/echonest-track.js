import DS from 'ember-data';

export default DS.Model.extend({
  title: DS.attr('string'),
  artist: DS.attr('string'),
  audio_summary: DS.attr(),

  song: DS.belongsTo('echonest-song', { async: true }),

  // injected by app
  echonest: null,

  analysis: function() {
    return this.get('echonest').fetchAnalysis(this);
  }.property(),

  bucket: [
    'audio_summary',
  ],
});
