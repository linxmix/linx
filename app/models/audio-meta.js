import Ember from 'ember';
import DS from 'ember-data';
import _ from 'npm:underscore';

import { timeToBeat } from 'linx/lib/utils';
import {
  BEAT_MARKER_TYPE,
  BAR_MARKER_TYPE,
  SECTION_MARKER_TYPE,
  FADE_IN_MARKER_TYPE,
  FADE_OUT_MARKER_TYPE,
  USER_MARKER_TYPE,
} from './marker';

export default DS.Model.extend({
  duration: DS.attr('number'),
  bpm: DS.attr('number'),
  timeSignature: DS.attr('number'),
  key: DS.attr('number'),
  mode: DS.attr('number'),
  loudness: DS.attr('number'),

  track: DS.belongsTo('track', { async: true }),

  markers: DS.hasMany('marker', { async: true }),
  userMarkers: Ember.computed.filterBy('markers', 'type', USER_MARKER_TYPE),
  analysisMarkers: Ember.computed.setDiff('markers', 'userMarkers'),

  markerSorting: ['start'],
  sortedMarkers: Ember.computed.sort('markers', 'markerSorting'),
  sortedBeatMarkers: Ember.computed.filterBy('sortedMarkers', 'type', BEAT_MARKER_TYPE),
  sortedBarMarkers: Ember.computed.filterBy('sortedMarkers', 'type', BAR_MARKER_TYPE),
  sortedSectionMarkers: Ember.computed.filterBy('sortedMarkers', 'type', SECTION_MARKER_TYPE),

  firstBeatMarker: Ember.computed.reads('sortedBeatMarkers.firstObject'),
  lastBeatMarker: Ember.computed.reads('sortedBeatMarkers.lastObject'),

  firstBeat: Ember.computed.reads('firstBeatMarker.startBeat'),
  lastBeat: Ember.computed.reads('lastBeatMarker.startBeat'),

  fadeInMarkers: Ember.computed.filterBy('sortedMarkers', 'type', FADE_IN_MARKER_TYPE),
  fadeInMarker: Ember.computed.reads('fadeInMarkers.firstObject'),

  fadeOutMarkers: Ember.computed.filterBy('sortedMarkers', 'type', FADE_OUT_MARKER_TYPE),
  fadeOutMarker: Ember.computed.reads('fadeOutMarkers.firstObject'),

  numBeats: function() {
    return ~~(timeToBeat(this.get('lastBeatMarker.start') - this.get('firstBeatMarker.start'), this.get('bpm')));
  }.property('lastBeatMarker.start', 'firstBeatMarker.start', 'bpm'),

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

  // Updates audio-meta based on the given EchonestTrack.Analysis
  // Returns a promise which resolves into this model
  processAnalysis: function(analysis) {
    var markerParams = [];

    // add start and end beat markers
    markerParams.push({
      type: BEAT_MARKER_TYPE,
      start: analysis.get('firstBeatStart'),
    });
    markerParams.push({
      type: BEAT_MARKER_TYPE,
      start: analysis.get('lastBeatStart'),
    });

    // add bar markers
    // markerParams = markerParams.concat(analysis.get('confidentBars').map((bar) => {
    //   return {
    //     type: BAR_MARKER_TYPE,
    //     start: bar.get('start'),
    //   };
    // }));

    // add section markers
    // markerParams = markerParams.concat(analysis.get('confidentSections').map((section) => {
    //   return {
    //     type: SECTION_MARKER_TYPE,
    //     start: section.get('start'),
    //   };
    // }));

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
    var markers = markerParams.map((params) => {
      return store.createRecord('marker', _.defaults(params, {
        audioMeta: this,
      }));
    });

    var markerSavePromises = markers.map((marker) => { return marker.save(); });

    return Ember.RSVP.all(markerSavePromises).then(() => {
      // TODO(CLEANUP)
      // return this.destroyAnalysisMarkers().then(() => {
        this.get('markers').pushObjects(markers);

        this.setProperties({
          duration: analysis.get('duration'),
          bpm: analysis.get('bpm'),
          timeSignature: analysis.get('timeSignature'),
          key: analysis.get('key'),
          mode: analysis.get('mode'),
          loudness: analysis.get('loudness'),
        });

        return this.save();
    // });
    });

  }
});
