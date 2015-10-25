import Ember from 'ember';
import DS from 'ember-data';

import {
  GRID_MARKER_TYPE,
  SECTION_MARKER_TYPE,
  FADE_IN_MARKER_TYPE,
  FADE_OUT_MARKER_TYPE,
  USER_MARKER_TYPE,
} from 'linx/models/marker';


// creates track with specifications
export default function(options = {}) {
  var firstBeatStart = Ember.getWithDefault(options, 'firstBeatStart', 0.15951140261485935);
  var lastBeatStart = Ember.getWithDefault(options, 'lastBeatStart', 367.30262532014035);

  var firstBeatMarker = this.factory.make('marker', {
    type: BEAT_MARKER_TYPE,
    start: firstBeatStart
  });

  var lastBeatMarker = this.factory.make('marker', {
    type: BEAT_MARKER_TYPE,
    start: lastBeatStart
  });

  var audioMeta = this.factory.make('audio-meta', {
    duration: 367.47320,
    bpm: 127.961,
    timeSignature: 4,
    key: 11,
    mode: 0,
    loudness: -4.804,
    markers: [firstBeatMarker, lastBeatMarker]
  });

  var track = this.factory.make('track', {
    _audioMeta: audioMeta
  });

  return track;
}
