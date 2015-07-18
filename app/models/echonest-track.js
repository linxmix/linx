import DS from 'ember-data';
import RequireAttributes from 'linx/lib/require-attributes';
import _ from 'npm:underscore';

import { bpmToSpb } from 'linx/lib/utils';

export const MIN_BEAT_CONFIDENCE = 0.5;
export const MIN_BAR_CONFIDENCE = 0.5;
export const MIN_SECTION_CONFIDENCE = 0.5;

export default DS.Model.extend({
  title: DS.attr('string'),
  artist: DS.attr('string'),
  audio_summary: DS.attr(),

  song: DS.belongsTo('echonest-song', { async: true }),

  bucket: [
    'audio_summary',
  ],

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

  // analysis params
  analysisUrl: Ember.computed.alias('audio_summary.analysis_url'),

  analysis: function() {
    return this.get('echonest').fetchAnalysis(this.get('analysisUrl'));

    // TODO: retry on failure
    //.catch((reason) => {
      //console.log("Echonest Analysis failed", reason);
      //throw reason;

      // var track = echonestTrack.get('track').then((track) => {
      //   if (track) {
      //     return this.fetchTrack(track).then((echonestTrack) => {
      //       echonestTrack.reload().then((echonestTrack) => {
      //         return this.fetchAnalysis(echonestTrack);
      //       });
      //     });
      //   } else {
      //     throw reason;
      //   }
      // });
    // });
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

  // the time of the first beat while still within track, using the most confident beat
  firstBeatStart: function() {
    var confidentBeat = this.get('confidentBeats.firstObject');
    if (!confidentBeat) {
      return 0;
    }

    var spb = bpmToSpb(this.get('bpm'));

    var firstBeatStart = confidentBeat.get('start');
    while ((firstBeatStart - spb) >= 0) {
      firstBeatStart -= spb;
    }

    return firstBeatStart;
  }.property('confidentBeats.firstObject.start', 'bpm'),

  firstBarStart: function() {
    // TODO
  }.property('beatMarkers.firstObject.start', 'bpm'),

  fadeInEnd: Ember.computed.alias('analysis.track.end_of_fade_in'),
  fadeOutStart: Ember.computed.alias('analysis.track.start_of_fade_out'),

  duration: Ember.computed.alias('audio_summary.duration'),
  bpm: Ember.computed.alias('audio_summary.tempo'),
  timeSignature: Ember.computed.alias('audio_summary.time_signature'),
  key: Ember.computed.alias('audio_summary.key'),
  mode: Ember.computed.alias('audio_summary.mode'),
  loudness: Ember.computed.alias('audio_summary.loudness'),

  beats: unitProperty('analysis.beats', 'beat'),
  bars: unitProperty('analysis.bars', 'bar'),
  sections: unitProperty('analysis.sections', 'section'),

  confidentBeats: Ember.computed.filterBy('beats', 'isConfident'),
  confidentBars: Ember.computed.filterBy('bars', 'isConfident'),
  confidentSections: Ember.computed.filterBy('sections', 'isConfident'),
});

const Unit = Ember.Object.extend(
  RequireAttributes('start', 'confidence', 'type'), {

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
  }.property('type')
});

function unitProperty (propertyPath, unitType) {
  return Ember.computed(`${propertyPath}.[]`, function() {
    return this.getWithDefault(propertyPath, []).map((params) => {
      return Unit.create(_.defaults(params, {
        type: unitType,
      }));
    }).sort('confidence');
  });
};
