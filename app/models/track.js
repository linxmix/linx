import Ember from 'ember';
import DS from 'ember-data';
import withDefaultModel from 'linx/lib/with-default-model';

export default DS.Model.extend({
  title: DS.attr('string'),
  artist: DS.attr('string'),
  length: DS.attr('number'),

  md5: DS.attr('string'),
  s3Url: DS.attr('string'),

  _echonestTrack: DS.belongsTo('echonest-track', { async: true }),
  echonestTrack: withDefaultModel('_echonestTrack', function() {
    return this.fetchEchonestTrack();
  }),

  _audioMeta: DS.belongsTo('audio-meta', { async: true, dependent: true }),
  audioMeta: withDefaultModel('_audioMeta', function() {
    return this.fetchAudioMeta();
  }),

  // injected by app
  echonest: null,

  streamUrl: Ember.computed.any('s3StreamUrl', 'scStreamUrl'),

  s3StreamUrl: function() {
    if (!Ember.isNone(this.get('s3Url'))) {
      // TODO: move to config
      return "http://s3-us-west-2.amazonaws.com/linx-music/" + this.get('s3Url');
    }
  }.property('s3Url'),

  // TODO
  scStreamUrl: function() {
    return null;
  }.property(),

  // TODO: fill out with identify linx md5 tracks, dedupe, etc
  identify: function() {
  },

  // figure out which track this is in echonest
  fetchEchonestTrack: function() {
    return this.get('echonest').fetchTrack(this)
      .then((echonestTrack) => {
        return echonestTrack;
      });
  },

  // analyze echonest track, then parse into new audio meta
  fetchAudioMeta: function() {
    return this.get('echonestTrack').then((echonestTrack) => {
      return echonestTrack.get('analysis').then((analysis) => {
        var audioMeta = this.get('store').createRecord('audio-meta', {
          track: this
        });
        return audioMeta.processAnalysis(analysis);
      });
    });
  },
});
