import Ember from 'ember';
import DS from 'ember-data';

import _ from 'npm:underscore';

import ReadinessMixin from 'linx/mixins/readiness';
import DependentRelationshipMixin from 'linx/mixins/models/dependent-relationship';

import {
  default as BeatGrid,
  timeToBeat as computedTimeToBeat,
  timeToBar as computedTimeToBar
} from './audio-meta/beat-grid';

import { roundTo, clamp } from 'linx/lib/utils';
import withDefault from 'linx/lib/computed/with-default';
import subtract from 'linx/lib/computed/subtract';
import {
  GRID_MARKER_TYPE,
  SECTION_MARKER_TYPE,
  FADE_IN_MARKER_TYPE,
  FADE_OUT_MARKER_TYPE,
  USER_MARKER_TYPE,
} from './marker';

export const BEAT_LEAD_TIME = 0.5;

export default DS.Model.extend(
  ReadinessMixin('isAudioMetaReady'),
  DependentRelationshipMixin('markers'), {

  duration: DS.attr('number'),
  bpm: DS.attr('number'),
  timeSignature: DS.attr('number'),
  key: DS.attr('number'),
  mode: DS.attr('number'),
  loudness: DS.attr('number'),

  track: DS.belongsTo('track', { async: true }),
  markers: DS.hasMany('marker', { async: true }),

  timeSort: ['start:asc'],
  sortedMarkers: Ember.computed.sort('markers', 'timeSort'),
  sortedUserMarkers: Ember.computed.filterBy('sortedMarkers', 'type', USER_MARKER_TYPE),
  sortedGridMarkers: Ember.computed.filterBy('sortedMarkers', 'type', GRID_MARKER_TYPE),
  sortedSectionMarkers: Ember.computed.filterBy('sortedMarkers', 'type', SECTION_MARKER_TYPE),
  sortedFadeInMarkers: Ember.computed.filterBy('sortedMarkers', 'type', FADE_IN_MARKER_TYPE),
  sortedFadeOutMarkers: Ember.computed.filterBy('sortedMarkers', 'type', FADE_OUT_MARKER_TYPE),

  analysisMarkers: Ember.computed.setDiff('sortedMarkers', 'sortedUserMarkers'),

  fadeInMarker: Ember.computed.reads('sortedFadeInMarkers.firstObject'),
  fadeOutMarker: Ember.computed.reads('sortedFadeOutMarkers.firstObject'),

  beatGrid: Ember.computed(function() {
    return BeatGrid.create({ audioMeta: this });
  }),

  startBeat: computedTimeToBeat('beatGrid', 0),
  startBar: computedTimeToBar('beatGrid', 0),
  endBeat: computedTimeToBeat('beatGrid', 'duration'),
  endBar: computedTimeToBar('beatGrid', 'duration'),
  numBeats: subtract('endBeat', 'startBeat'),

  // TODO
  // amount by which echonest analysis is off from the downbeats
  // this is calculated from the calculated first bar, and the confident first bar
  echonestBeatOffset: function() {
  }.property('beatGrid'),

  destroyMarkers: function() {
    return this.get('markers').then((markers) => {
      return Ember.RSVP.all(markers.map((marker) => {
        return marker && marker.destroyRecord();
      }));
    });
  },

  destroyAnalysisMarkers: function() {
    return this.get('markers').then(() => {
      return Ember.RSVP.all(this.get('analysisMarkers').map((marker) => {
        return marker && marker.destroyRecord();
      }));
    });
  },

  createMarker(params) {
    let marker = this.get('store').createRecord('marker', params);

    return marker.save().then(() => {
      this.get('markers').addObject(marker);

      return this.save().then(() => marker);
    });
  },

  // implement readiness
  isAudioMetaReady: Ember.computed.not('isProcessingAnalysis'),

  // Updates audio-meta based on the given EchonestTrack.Analysis
  // Returns a promise which resolves into this model
  isProcessingAnalysis: false,
  processAnalysis: function(analysis) {
    if (this.get('isProcessingAnalysis')) {
      return console.log("WARNING: processAnalysis called while already isProcessingAnalysis");
    } else {
      this.set('isProcessingAnalysis', true);
    }

    let markerParams = [];

    // add highest confidence bar as grid marker
    let confidentBar = analysis.get('confidenceSortedBeats.firstObject');
    markerParams.push({
      type: GRID_MARKER_TYPE,
      start: confidentBar.start,
      confidence: confidentBar.confidence,
    });

    // add section markers
    markerParams = markerParams.concat(analysis.get('timeSortedSections').map((section) => {
      return {
        type: SECTION_MARKER_TYPE,
        start: section.get('start'),
        confidence: section.get('confidence'),
      };
    }));

    // add fadeIn and fadeOut markers
    markerParams.push({
      type: FADE_IN_MARKER_TYPE,
      start: analysis.get('endOfFadeIn'),
    });
    markerParams.push({
      type: FADE_OUT_MARKER_TYPE,
      start: analysis.get('startOfFadeOut'),
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
