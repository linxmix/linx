import Ember from 'ember';
import DS from 'ember-data';
import { timeToBeat } from 'linx/lib/utils';
import withDefault from 'linx/lib/with-default';
import RequireAttributes from 'linx/lib/require-attributes';
import _ from 'npm:underscore';

export const MIN_BEAT_CONFIDENCE = 0.5;
export const MIN_BAR_CONFIDENCE = 0.5;
export const MIN_SECTION_CONFIDENCE = 0.5;

const Unit = Ember.Object.extend(
  RequireAttributes('start', 'confidence', 'type', 'bpm'), {

  // optional params
  duration: null,

  isConfident: function() {
    return this.get('confidence') >= this.get('minConfidence');
  }.property('confidence', 'minConfidence'),

  minConfidence: function() {
    switch (this.get('type')) {
      case 'beat': return MIN_BEAT_CONFIDENCE; break;
      case 'bar': return MIN_BAR_CONFIDENCE; break;
      case 'section': return MIN_SECTION_CONFIDENCE; break;
    }
  }.property('type'),

  startBeat: function() {
    return timeToBeat(this.get('start'), this.get('bpm'));
  }.property('start', 'bpm')
});

const unitProperty = function(propertyPath, unitType) {
  return Ember.computed(propertyPath, 'bpm', function() {
    var bpm = this.get('bpm');

    return this.getWithDefault(propertyPath, []).map((params) => {
      return Unit.create(_.defaults(params, {
        type: unitType,
        bpm: bpm,
      }));
    });
  });
};

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

  bpm: Ember.computed.alias('audioSummary.tempo'),
  timeSignature: Ember.computed.alias('audioSummary.time_signature'),
  key: Ember.computed.alias('audioSummary.key'),
  loudness: Ember.computed.alias('audioSummary.loudness'),

  fadeInEndBeat: function() {
    var time = this.get('analysis.track.end_of_fade_in');
    return timeToBeat(time, this.get('bpm'));
  }.property('analysis.track.end_of_fade_in', 'bpm'),

  fadeOutStartBeat: function() {
    var time = this.get('analysis.track.start_of_fade_out');
    return timeToBeat(time, this.get('bpm'));
  }.property('analysis.track.start_of_fade_out', 'bpm'),

  beats: unitProperty('analysis.beats', 'beat'),
  bars: unitProperty('analysis.bars', 'bar'),
  sections: unitProperty('analysis.sections', 'section'),

  confidentBeats: Ember.computed.filterBy('beats', 'isConfident'),
  confidentBars: Ember.computed.filterBy('bars', 'isConfident'),
  confidentSections: Ember.computed.filterBy('sections', 'isConfident'),

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
