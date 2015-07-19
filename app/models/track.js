import Ember from 'ember';
import DS from 'ember-data';

export default DS.Model.extend({
  title: DS.attr('string'),
  artist: DS.attr('string'),
  length: DS.attr('number'),

  md5: DS.attr('string'),
  s3Url: DS.attr('string'),

  _echonestTrack: DS.belongsTo('echonest-track', { async: true }),
  _audioMeta: DS.belongsTo('audio-meta', { async: true, dependent: true }),

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

  // if we have not yet identified this track in echonest, upload and return promise object
  // otherwise, load the relationship as normal
  echonestTrack: function() {
    var echonestTrackId = this.get('_data._echonestTrack');

    if (!this.get('isLoaded') || echonestTrackId) {
      return this.get('_echonestTrack');
    } else {
      return DS.PromiseObject.create({
        promise: this.fetchEchonestTrack(),
      });
    }
  }.property('isLoaded', '_echonestTrack'),

  fetchEchonestTrack: function() {
    return this.get('echonest').fetchTrack(this)
      .then((echonestTrack) => {
        this.set('_echonestTrack', echonestTrack);
        return this.save().then(() => {
          return echonestTrack;
        });
      });
  },

  // if we have no audio meta for this track, create new and parse echonest analysis
  // otherwise, load the relationship as normal
  audioMeta: function() {
    var audioMetaId = this.get('_data.audioMeta');

    if (!this.get('isLoaded') || audioMetaId) {
      return this.get('_echonestTrack');
    } else {
      return DS.PromiseObject.create({
        promise: this.get('echonestTrack').then((echonestTrack) => {
          return this.get('echonestAnalysis').then((echonestAnalysis) => {
            var audioMeta = this.get('store').createRecord('audio-meta');
            audioMeta.processAnalysis(analysis);
            return audioMeta;
          });
        }),
      });
    }
  }.property('isLoaded', '_audioMeta'),

  echonestAnalysis: Ember.computed.alias('echonestTrack.analysis')
});
