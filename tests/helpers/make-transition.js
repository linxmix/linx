import Ember from 'ember';
import DS from 'ember-data';

import {
  BEAT_MARKER_TYPE,
  BAR_MARKER_TYPE,
  SECTION_MARKER_TYPE,
  FADE_IN_MARKER_TYPE,
  FADE_OUT_MARKER_TYPE,
  USER_MARKER_TYPE,
} from 'linx/models/marker';


// creates transition with specifications
export default function(options = {}) {
  var fromTrackEnd = Ember.getWithDefault(options, 'fromTrackEnd', 100);
  var toTrackStart = Ember.getWithDefault(options, 'toTrackStart', 50);

  var firstBeatMarker = this.factory.make('marker', {
    type: BEAT_MARKER_TYPE,
    start: firstBeatStart
  });

  var lastBeatMarker = this.factory.make('marker', {
    type: BEAT_MARKER_TYPE,
    start: lastBeatStart
  });

  var track = this.factory.make('track');

  // make withDefaultModel think track has audioMeta
  track.set('_data', {
    _audioMeta: 1
  });

  var audioMeta = this.factory.make('audio-meta', {
    track: track,
    bpm: 128.00,
    duration: 367.47320,
    bpm: 127.961,
    timeSignature: 4,
    key: 11,
    mode: 0,
    loudness: -4.804,
    markers: [firstBeatMarker, lastBeatMarker]
  });

  return track;
};
