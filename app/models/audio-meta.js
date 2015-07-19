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

  markers: DS.hasMany('marker', { async: true }),
  userMarkers: Ember.computed.filterBy('markers', 'type', USER_MARKER_TYPE),
  analysisMarkers: Ember.computed.setDiff('markers', 'userMarkers'),

  sortedMarkers: Ember.computed.sort('markers', 'start'),
  sortedBeatMarkers: Ember.computed.filterBy('sortedMarkers', 'type', BEAT_MARKER_TYPE),
  sortedBarMarkers: Ember.computed.filterBy('sortedMarkers', 'type', BAR_MARKER_TYPE),
  sortedSectionMarkers: Ember.computed.filterBy('sortedMarkers', 'type', SECTION_MARKER_TYPE),

  firstBeatMarker: Ember.computed.alias('sortedBeatMarkers.firstObject'),

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
  parseAnalysis: function(analysis) {
    var markerParams = [];

    // add beat marker
    markerParams.push({
      type: BEAT_MARKER_TYPE,
      start: analysis.get('firstBeatStart'),
    });

    // add bar markers
    markerParams.concat(analysis.get('confidentBars').map((bar) => {
      return {
        type: BAR_MARKER_TYPE,
        start: bar.get('start'),
      };
    }));

    // add section markers
    markerParams.concat(analysis.get('confidentSections').map((section) => {
      return {
        type: SECTION_MARKER_TYPE,
        start: section.get('start'),
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
    var markers = markerParams.map((params) => {
      return store.createRecord('marker', _.defaults(params, {
        track: this,
      }));
    });
    var markerSavePromises = markers.map((marker) => { return marker.save(); });

    return Ember.RSVP.all(markerSavePromises).then(() => {
      return this.destroyAnalysisMarkers().then(() => {
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
      });
    });

  }
});
