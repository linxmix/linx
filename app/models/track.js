import Ember from 'ember';
import DS from 'ember-data';

export default DS.Model.extend({
  title: DS.attr('string'),
  artist: DS.attr('string'),
  length: DS.attr('number'),

  md5: DS.attr('string'),
  s3Url: DS.attr('string'),

  audioClip: DS.hasMany('audio-clip', { async: true }),
  linkedEchonestTrack: DS.belongsTo('echonest-track', { async: true }),

  // injected by app
  echonest: null,

  // params
  streamUrl: Ember.computed.any('s3StreamUrl', 'scStreamUrl'),
  analysis: Ember.computed.alias('echonestTrack.analysis'),

  s3StreamUrl: function() {
    return "http://s3-us-west-2.amazonaws.com/linx-music/" + this.get('s3Url');
  }.property('s3Url'),

  // TODO
  scStreamUrl: function() {
    return null;
  }.property(),


  // TODO: fill out with identify linx md5 tracks, dedupe, etc
  identify: function() {
    return this.identifyInEchonest();
  },

  // if we have not yet identified this track in echonest, upload and return promise object
  // otherwise, fetch this track
  echonestTrack: function() {
    var echonestTrackId = this.get('_data.linkedEchonestTrack');

    // cannot get echonestTrack without a streamUrl
    if (!this.get('streamUrl')) { return; }

    // if we already have echonest track ID, load the relation
    if (echonestTrackId) {
      return this.get('linkedEchonestTrack');
    // else fetch the echonest track
    } else {
      return this.fetchEchonestTrack();
    }
  }.property('streamUrl', '_data.linkedEchonestTrack'),

  fetchEchonestTrack: function() {
    return this.get('echonest').fetchTrack(this).then((echonestTrack) => {
      this.set('linkedEchonestTrack', echonestTrack);
      this.save();
      return echonestTrack;
    });
  }
});
