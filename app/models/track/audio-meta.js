import Ember from 'ember';
import DS from 'ember-data';

import { task } from 'ember-concurrency';
import _ from 'npm:underscore';

import ReadinessMixin from 'linx/mixins/readiness';
import DependentRelationshipMixin from 'linx/mixins/models/dependent-relationship';

import {
  default as BeatGrid,
  computedTimeToBeat,
  computedTimeToBar,
  computedBarToBeat,
  computedQuantizeBar,
} from './audio-meta/beat-grid';
import {
  GRID_MARKER_TYPE,
  SECTION_MARKER_TYPE,
  FADE_IN_MARKER_TYPE,
  FADE_OUT_MARKER_TYPE,
  USER_MARKER_TYPE,
} from './audio-meta/marker';

import { roundTo, clamp, isValidNumber } from 'linx/lib/utils';
import withDefault from 'linx/lib/computed/with-default';
import subtract from 'linx/lib/computed/subtract';
import lookup from 'linx/lib/computed/lookup';
import add from 'linx/lib/computed/add';
import computedObject from 'linx/lib/computed/object';

export const BEAT_LEAD_TIME = 0.5;

export const CAMELOT_KEYS = {
  'Abm':  '1a',
  'B':    '1b',
  'Ebm':  '2a',
  'Gb':   '2b',
  'Bbm':  '3a',
  'Db':   '3b',
  'Fm':   '4a',
  'Ab':   '4b',
  'Cm':   '5a',
  'Eb':   '5b',
  'Gm':   '6a',
  'Bb':   '6b',
  'Dm':   '7a',
  'F':    '7b',
  'Am':   '8a',
  'C':    '8b',
  'Em':   '9a',
  'G':    '9b',
  'Bm':   '10a',
  'D':    '10b',
  'Gbm':  '11a',
  'A':    '11b',
  'Dbm':  '12a',
  'E':    '12b',
};

export const ECHONEST_KEYS = {
  '0':  'C',
  '1':  'Db',
  '2':  'D',
  '3':  'Eb',
  '4':  'E',
  '5':  'F',
  '6':  'Gb',
  '7':  'G',
  '8':  'Ab',
  '9':  'A',
  '10': 'Bb',
  '11': 'B',
};

export const ECHONEST_MODES = {
  '0': 'minor',
  '1': 'major'
};

// Replay Gain algorithm to convert from db to gain and back
// http://wiki.hydrogenaud.io/index.php?title=ReplayGain_2.0_specification
export const TARGET_LOUDNESS = -14; // 14db headroom
// export const DEFAULT_GAIN = 0.8;
export const DEFAULT_GAIN = 0.9;

export function loudnessToGain(loudness) {
  // how far off we are from target loudness
  const delta = TARGET_LOUDNESS - loudness;
  return Math.pow(10, delta / 20.0);
}

export function gainToLoudness(gain) {
  return TARGET_LOUDNESS - 20 * Math.log10(gain);
}

export default DS.Model.extend(
  ReadinessMixin('isAudioMetaReady'),
  DependentRelationshipMixin('markers'), {

  duration: DS.attr('number'),
  bpm: DS.attr('number'),
  timeSignature: DS.attr('number', { defaultValue: 4 }),
  key: DS.attr('number'),
  keyText: DS.attr('string'), // TODO(TECHDEBT)
  mode: DS.attr('number'),
  loudness: DS.attr('number'),
  barGridTime: DS.attr('number'),

  beatGrid: computedObject(BeatGrid, {
    duration: 'duration',
    bpm: 'bpm',
    timeSignature: 'timeSignature',
    // TODO(MULTIGRID): make this use real thing
    barGridTime: 0,
  }),

  // TODO(MULTIGRID): adapt for multiple grid markers. Piecewise-Scale? or a long domain/range?
  nudge(value) {
    Ember.assert('Cannot nudge AudioMeta.barGridTime without numeric value', isValidNumber(value));

    this.set('barGridTime', this.get('barGridTime') + value);
  },

  // // calculate gain from loudness (decibels)
  // gain: Ember.computed('loudness', {
  //   get() {
  //     const loudness = this.get('loudness');
  //     return isValidNumber(loudness) ? loudnessToGain(loudness) : DEFAULT_GAIN;
  //   },

  //   set(key, gain) {
  //     Ember.assert('Must set audioMeta.gain to valid number', isValidNumber(gain));

  //     this.set('loudness', gainToLoudness(gain));
  //     return gain;
  //   },
  // }),

  track: DS.belongsTo('track', { async: true }),
  markers: DS.hasMany('track/audio-meta/marker', { async: true }),

  // something like 'C' or 'Cbm'
  keyName: Ember.computed('key', 'mode', function() {
    const modeString = this.get('mode') === 1 ? '' : 'm';

    const key = this.get('key');
    const keyString = isValidNumber(key) ? ECHONEST_KEYS[key] : '';

    return keyString.concat(modeString);
  }),

  camelotKey: lookup('keyName', CAMELOT_KEYS),

  timeSort: ['time:asc'],
  sortedMarkers: Ember.computed.sort('markers', 'timeSort'),
  sortedUserMarkers: Ember.computed.filterBy('sortedMarkers', 'type', USER_MARKER_TYPE),
  sortedGridMarkers: Ember.computed.filterBy('sortedMarkers', 'type', GRID_MARKER_TYPE),
  sortedSectionMarkers: Ember.computed.filterBy('sortedMarkers', 'type', SECTION_MARKER_TYPE),
  sortedFadeInMarkers: Ember.computed.filterBy('sortedMarkers', 'type', FADE_IN_MARKER_TYPE),
  sortedFadeOutMarkers: Ember.computed.filterBy('sortedMarkers', 'type', FADE_OUT_MARKER_TYPE),

  analysisMarkers: Ember.computed.setDiff('sortedMarkers', 'sortedUserMarkers'),

  fadeInMarker: Ember.computed.reads('sortedFadeInMarkers.firstObject'),
  fadeOutMarker: Ember.computed.reads('sortedFadeOutMarkers.firstObject'),

  startBeat: computedTimeToBeat('beatGrid', 0),
  startBar: computedTimeToBar('beatGrid', 0),
  endBeat: computedTimeToBeat('beatGrid', 'duration'),
  endBar: computedTimeToBar('beatGrid', 'duration'),
  beatCount: subtract('endBeat', 'startBeat'),
  halfBeatCount: Ember.computed('beatCount', function() {
    return this.get('beatCount') / 2.0;
  }),
  halfBarCount: Ember.computed('halfBeatCount', 'timeSignature', function() {
    return this.get('halfBeatCount') / this.get('timeSignature');
  }),
  centerBeat: add('startBeat', 'halfBeatCount'),

  firstWholeBeat: 0,
  firstWholeBar: 0,
  lastWholeBeat: computedBarToBeat('beatGrid', 'lastWholeBar'),
  lastWholeBar: computedQuantizeBar('beatGrid', 'endBar'),

  // TODO: implement this, and move to audio-meta/beat-grid?
  // amount by which echonest analysis is off from the downbeats
  // calculated by diff from echonest section markers and the grid marker
  echonestBeatOffset: Ember.computed('beatGrid.beatScale', 'beatGrid.barScale', function() {
  }),

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
    let marker = this.get('store').createRecord('track/audio-meta/marker', params);

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
      return Ember.Logger.log("WARNING: processAnalysis called while already isProcessingAnalysis");
    } else {
      this.set('isProcessingAnalysis', true);
    }

    let markerParams = [];

    // add highest confidence beat as grid marker
    let confidentBar = analysis.get('confidenceSortedBeats.firstObject');
    confidentBar && markerParams.push({
      type: GRID_MARKER_TYPE,
      time: confidentBar.start,
      confidence: confidentBar.confidence,
    });

    // add section markers
    markerParams = markerParams.concat(analysis.get('timeSortedSections').map((section) => {
      return {
        type: SECTION_MARKER_TYPE,
        time: section.get('start'),
        confidence: section.get('confidence'),
      };
    }));

    // add fadeIn and fadeOut markers
    markerParams.push({
      type: FADE_IN_MARKER_TYPE,
      time: analysis.get('endOfFadeIn'),
    });
    markerParams.push({
      type: FADE_OUT_MARKER_TYPE,
      time: analysis.get('startOfFadeOut'),
    });

    // create and save all markers, then set properties and save track
    let store = this.get('store');
    let track = this.get('track');

    return this.destroyAnalysisMarkers().then(() => {
      let markers = markerParams.map((params) => {
        return store.createRecord('track/audio-meta/marker', _.defaults(params, {
          audioMeta: this,
        }));
      });
      let markerSavePromises = markers.map((marker) => { return marker.save(); });

      return Ember.RSVP.all(markerSavePromises).then(() => {
        this.get('markers').pushObjects(markers);

        this.setProperties({
          duration: analysis.get('duration'),
          bpm: analysis.get('bpm') || 100,
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
