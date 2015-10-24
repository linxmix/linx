import Ember from 'ember';
import DS from 'ember-data';

import _ from 'npm:underscore';

import ReadinessMixin from 'linx/mixins/readiness';
import DependentRelationshipMixin from 'linx/mixins/models/dependent-relationship';

import { timeToBeat, roundTo, clamp } from 'linx/lib/utils';
import withDefault from 'linx/lib/computed/with-default';
import add from 'linx/lib/computed/add';
import {
  BEAT_MARKER_TYPE,
  BAR_MARKER_TYPE,
  SECTION_MARKER_TYPE,
  FADE_IN_MARKER_TYPE,
  FADE_OUT_MARKER_TYPE,
  USER_MARKER_TYPE,
} from './marker';

export const BEAT_LEAD_TIME = 0.5;

export default DS.Model.extend(
  ReadinessMixin('isAudioMetaReady'),
  DependentRelationshipMixin('markers'),
  DependentRelationshipMixin('analysisMarkers'), {

  duration: DS.attr('number'),
  bpm: DS.attr('number'),
  timeSignature: DS.attr('number'),
  key: DS.attr('number'),
  mode: DS.attr('number'),
  loudness: DS.attr('number'),

  track: DS.belongsTo('track', { async: true }),

  markers: DS.hasMany('marker', { async: true }),
  analysisMarkers: DS.hasMany('marker', { async: true }),

  timeSort: ['start:asc'],
  sortedMarkers: Ember.computed.sort('markers', 'timeSort'),
  sortedBeatMarkers: Ember.computed.filterBy('sortedMarkers', 'type', BEAT_MARKER_TYPE),
  sortedBarMarkers: Ember.computed.filterBy('sortedMarkers', 'type', BAR_MARKER_TYPE),
  sortedSectionMarkers: Ember.computed.filterBy('sortedMarkers', 'type', SECTION_MARKER_TYPE),

  sortedAnalysisMarkers: Ember.computed.sort('analysisMarkers', 'timeSort'),
  sortedAnalysisBeatMarkers: Ember.computed.filterBy('sortedAnalysisMarkers', 'type', BEAT_MARKER_TYPE),
  sortedAnalysisBarMarkers: Ember.computed.filterBy('sortedAnalysisMarkers', 'type', BAR_MARKER_TYPE),
  sortedAnalysisSectionMarkers: Ember.computed.filterBy('sortedAnalysisMarkers', 'type', SECTION_MARKER_TYPE),
  sortedAnalysisFadeInMarkers: Ember.computed.filterBy('sortedAnalysisMarkers', 'type', FADE_IN_MARKER_TYPE),
  sortedAnalysisFadeOutMarkers: Ember.computed.filterBy('sortedAnalysisMarkers', 'type', FADE_OUT_MARKER_TYPE),

  analysisFadeInMarker: Ember.computed.reads('sortedAnalysisFadeInMarkers'),

  // TODO: adapt for multiple grid markers
  gridMarker: Ember.computed.or('sortedBeatMarkers.firstObject', 'sortedAnalysisBeatMarkers.firstObject'),
  barGridMarker: Ember.computed.or('sortedBarMarkers.firstObject', 'sortedAnalysisBarMarkers.firstObject'),

  getNearestBeat(time) {
    return clamp(0, Math.round(timeToBeat(time, this.get('bpm'))), this.get('numBeats'));
  },

  getNearestBar(time) {
    let beat = this.getNearestBeat(time);
    let bar = roundTo(beat, 4);

    if (bar > this.get('numBeats')) {
      return bar - 4;
    }

    return bar;
  },

  // the time of the first down beat, using the first beat and the most confident beat
  fadeInBeat: Ember.computed('gridMarker', 'bpm', 'numBeats', function() {
    return this.getNearestBeat(this.get(''))
  }),

  fadeOutBeat: Ember.computed('gridMarker', 'bpm', 'numBeats', function() {

  }),

  numBeats: function() {
    return timeToBeat(this.get('duration'), this.get('bpm'));
  }.property('duration', 'bpm'),

  destroyMarkers: function() {
    return this.get('markers').then((markers) => {
      return Ember.RSVP.all(markers.map((marker) => {
        return marker && marker.destroyRecord();
      }));
    });
  },

  destroyAnalysisMarkers: function() {
    return this.get('markers').then((markers) => {
      return Ember.RSVP.all(this.get('analysisMarkers').map((marker) => {
        return marker && marker.destroyRecord();
      }));
    });
  },

  // implement readiness
  isAudioMetaReady: Ember.computed.not('isProcessingAnalysis'),


  confidentBarStart: withDefault('confidentBars.firstObject.start', 0),
  confidentBeatStart: withDefault('confidentBeats.firstObject.start', 0),
  firstBeatStart: withDefault('sortedBeats.firstObject.start', 0),

  // the time of the first down beat, using the first beat and the most confident beat
  firstBarStart: function() {
    let spb = bpmToSpb(this.get('bpm'));

    let firstBarStart = this.get('confidentBeatStart');
    while (Math.round(firstBarStart - spb) > Math.round(this.get('firstBeatStart'))) {
      firstBarStart -= spb;
    }

    return firstBarStart;
  }.property('confidentBeatStart', 'firstBeatStart', 'bpm'),

  // amount by which echonest analysis is off from the downbeats
  // this is calculated from the calculated first bar, and the confident first bar
  echonestBeatOffset: function() {

  }.property('firstBarStart', 'confidentBarStart'),


  // Updates audio-meta based on the given EchonestTrack.Analysis
  // Returns a promise which resolves into this model
  isProcessingAnalysis: false,
  processAnalysis: function(analysis) {
    if (this.get('isProcessingAnalysis')) {
      return console.log("WARNING: processAnalysis called while already isProcessingAnalysis");
    }

    this.set('isProcessingAnalysis', true);

    var markerParams = [];

    // add confident beat marker
    markerParams.push({
      type: BEAT_MARKER_TYPE,
      start: analysis.get('confidentBeatStart'),
    });

    // add first bar marker
    markerParams.push({
      type: BAR_MARKER_TYPE,
      start: analysis.get('firstBarStart'),
    });

    // add beat markers
    // markerParams = markerParams.concat(analysis.get('sortedBeats').slice(0, 10).map((beat) => {
    //   return {
    //     type: BEAT_MARKER_TYPE,
    //     start: beat.get('start'),
    //   };
    // }));

    // add bar markers
    // markerParams = markerParams.concat(analysis.get('confidentBars').slice(0, 10).map((bar) => {
    //   return {
    //     type: BAR_MARKER_TYPE,
    //     start: bar.get('start'),
    //   };
    // }));

    // add section markers
    markerParams = markerParams.concat(analysis.get('confidentSections').map((section) => {
      return {
        type: SECTION_MARKER_TYPE,
        start: section.get('start'),
        confidence: section.get('confidence'),
      };
    }));

    // add fadeIn and fadeOut markers
    markerParams.push({
      type: FADE_IN_MARKER_TYPE,
      start: analysis.get('fadeInTime'),
    });
    markerParams.push({
      type: FADE_OUT_MARKER_TYPE,
      start: analysis.get('fadeOutTime'),
    });

    // create and save all markers, then set properties and save track
    var store = this.get('store');
    var track = this.get('track');

    return this.destroyAnalysisMarkers().then(() => {
      let markers = markerParams.map((params) => {
        return store.createRecord('marker', _.defaults(params, {
          audioMeta: this,
        }));
      });
      let markerSavePromises = markers.map((marker) => { return marker.save(); });

      return Ember.RSVP.all(markerSavePromises).then(() => {
        this.get('markers').pushObjects(markers);

        this.setProperties({
          duration: analysis.get('duration'),
          bpm: analysis.get('bpm'),
          timeSignature: analysis.get('timeSignature'),
          key: analysis.get('key'),
          mode: analysis.get('mode'),
          loudness: analysis.get('loudness'),
        });

        return this.save().then(() => {
          this.set('isProcessingAnalysis', false);
          return this;
        });
      });
    });

  }
});
