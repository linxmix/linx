import Ember from 'ember';
import DS from 'ember-data';

export default DS.Model.extend({
  title: DS.attr('string'),
  artist: DS.attr('string'),
  length: DS.attr('number'),

  md5: DS.attr('string'),
  s3Url: DS.attr('string'),

  audioClip: DS.hasMany('audio-clip', { async: true }),
  _echonestTrack: DS.belongsTo('echonest-track', { async: true }),

  // injected by app
  echonest: null,

  // params
  streamUrl: Ember.computed.any('s3StreamUrl', 'scStreamUrl'),
  audioSummary: Ember.computed.alias('echonestTrack.audio_summary'),
  bpm: Ember.computed.alias('audioSummary.tempo'),
  bps: function() {
    return this.get('bpm') / 60.0;
  }.property('bpm'),
  spb: function() {
    return 1 / this.get('bps');
  }.property('bps'),
  analysis: Ember.computed.alias('echonestTrack.analysis'),
  firstBeatTime: function() {
    var beatStartTime = this.get('analysis.beats.firstObject.start');
    return beatStartTime;
  }.property('analysis.beats.firstObject.start'),

  s3StreamUrl: function() {
    if (!Ember.isNone(this.get('s3Url'))) {
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
      return this.fetchEchonestTrack();
    }
  }.property('isLoaded', '_echonestTrack'),

  fetchEchonestTrack: function() {
    var promiseObject = this.get('echonest').fetchTrack(this);

    promiseObject.then((echonestTrack) => {
      this.set('_echonestTrack', echonestTrack);
      this.save();
    });

    return promiseObject;
  },
});
