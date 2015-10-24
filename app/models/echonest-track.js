import Ember from 'ember';
import DS from 'ember-data';
import RequireAttributes from 'linx/lib/require-attributes';
import _ from 'npm:underscore';

import { bpmToSpb, asResolvedPromise } from 'linx/lib/utils';

const Analysis = Ember.Object.extend(
  RequireAttributes('analysis'), {

  endOfFadeIn: Ember.computed.reads('analysis.track.end_of_fade_in'),
  startOfFadeOut: Ember.computed.reads('analysis.track.start_of_fade_out'),

  duration: Ember.computed.reads('analysis.track.duration'),
  bpm: Ember.computed.reads('analysis.track.tempo'),
  timeSignature: Ember.computed.reads('analysis.track.time_signature'),
  key: Ember.computed.reads('analysis.track.key'),
  mode: Ember.computed.reads('analysis.track.mode'),
  loudness: Ember.computed.reads('analysis.track.loudness'),

  beats: unitProperty('analysis.beats', 'beat'),
  bars: unitProperty('analysis.bars', 'bar'),
  sections: unitProperty('analysis.sections', 'section'),

  confidentBeats: Ember.computed.filterBy('beats', 'isConfident'),
  confidentBars: Ember.computed.filterBy('bars', 'isConfident'),
  confidentSections: Ember.computed.filterBy('sections', 'isConfident'),

  timeSort: ['start:asc'],
  timeSortedBeats: Ember.computed.sort('confidentBeats', 'timeSort'),
  timeSortedBars: Ember.computed.sort('confidentBars', 'timeSort'),
  timeSortedSections: Ember.computed.sort('confidentSections', 'timeSort'),

  confidenceSort: ['confidence:desc'],
  confidenceSortedBeats: Ember.computed.sort('confidentBeats', 'confidenceSort'),
  confidenceSortedBars: Ember.computed.sort('confidentBars', 'confidenceSort'),
  confidenceSortedSections: Ember.computed.sort('confidentSections', 'confidenceSort'),
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
        // TODO: is _data._echonestTrack still correct?
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
    return asResolvedPromise(this);
  },
});

function unitProperty (propertyPath, unitType) {
  return Ember.computed(`${propertyPath}.[]`, function() {
    return this.getWithDefault(propertyPath, []).map((params) => {
      return Unit.create(_.defaults(params, {
        type: unitType,
      }));
    });
  });
}
