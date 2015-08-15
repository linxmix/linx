import Ember from 'ember';
import DS from 'ember-data';
import RequireAttributes from 'linx/lib/require-attributes';
import _ from 'npm:underscore';
import withDefault from 'linx/lib/computed/with-default';

import { bpmToSpb, assertPromise } from 'linx/lib/utils';

const Analysis = Ember.Object.extend(
  RequireAttributes('analysis'), {

  confidentBeatStart: withDefault('confidentBeats.firstObject.start', 0),

  // the time of the first beat while still within track, using the most confident beat
  firstBeatStart: function() {
    var spb = bpmToSpb(this.get('bpm'));

    var firstBeatStart = this.get('confidentBeatStart');
    while ((firstBeatStart - spb) >= 0) {
      firstBeatStart -= spb;
    }

    return firstBeatStart;
  }.property('confidentBeats.firstObject.start', 'bpm'),

  // the time of the last beat while still within track
  lastBeatStart: function() {
    var duration = this.get('duration');
    var spb = bpmToSpb(this.get('bpm'));

    var lastBeatStart = this.get('confidentBeatStart');
    while ((lastBeatStart + spb) <= duration) {
      lastBeatStart += spb;
    }

    return lastBeatStart;
  }.property('firstBeatStart', 'bpm', 'duration'),

  firstBarStart: function() {
    // TODO
  }.property('beatMarkers.firstObject.start', 'bpm'),

  fadeInTime: Ember.computed.alias('analysis.track.end_of_fade_in'),
  fadeOutTime: Ember.computed.alias('analysis.track.start_of_fade_out'),

  duration: Ember.computed.alias('analysis.track.duration'),
  bpm: Ember.computed.alias('analysis.track.tempo'),
  timeSignature: Ember.computed.alias('analysis.track.time_signature'),
  key: Ember.computed.alias('analysis.track.key'),
  mode: Ember.computed.alias('analysis.track.mode'),
  loudness: Ember.computed.alias('analysis.track.loudness'),

  beats: unitProperty('analysis.beats', 'beat'),
  bars: unitProperty('analysis.bars', 'bar'),
  sections: unitProperty('analysis.sections', 'section'),

  confidentBeats: Ember.computed.filterBy('beats', 'isConfident'),
  confidentBars: Ember.computed.filterBy('bars', 'isConfident'),
  confidentSections: Ember.computed.filterBy('sections', 'isConfident'),
});

export const MIN_BEAT_CONFIDENCE = 0.5;
export const MIN_BAR_CONFIDENCE = 0.5;
export const MIN_SECTION_CONFIDENCE = 0.5;

const Unit = Ember.Object.extend(
  RequireAttributes('start', 'confidence', 'type'), {

  // optional params
  duration: null,

  isConfident: function() {
    return this.get('confidence') >= this.get('minConfidence');
  }.property('confidence', 'minConfidence'),

  minConfidence: function() {
    switch (this.get('type')) {
      case 'beat': return MIN_BEAT_CONFIDENCE;
      case 'bar': return MIN_BAR_CONFIDENCE;
      case 'section': return MIN_SECTION_CONFIDENCE;
    }
  }.property('type')
});

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
      // TODO(findQuery)
      promise: this.get('store').findAll('track').then((records) => {
        return records.filterBy('_data._echonestTrack', this.get('id')).get('firstObject');
      }),
    });
  }),

  analysisUrl: Ember.computed.alias('audio_summary.analysis_url'),
  analysis: function() {
    return DS.PromiseObject.create({
      promise: this.get('echonest').fetchAnalysis(this.get('analysisUrl')).then((analysis) => {
        return Analysis.create({
          analysis: analysis
        });
      }),
    });

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

  // TODO: shouldnt need to do this, called from dependent model
  save: function() {
    return assertPromise(this);
  },
});

function unitProperty (propertyPath, unitType) {
  return Ember.computed(`${propertyPath}.[]`, function() {
    return this.getWithDefault(propertyPath, []).map((params) => {
      return Unit.create(_.defaults(params, {
        type: unitType,
      }));
    }).sort('confidence');
  });
}
