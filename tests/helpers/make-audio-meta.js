import Ember from 'ember';
import DS from 'ember-data';

import _ from 'npm:underscore';

import {
  GRID_MARKER_TYPE,
  SECTION_MARKER_TYPE,
  FADE_IN_MARKER_TYPE,
  FADE_OUT_MARKER_TYPE,
  USER_MARKER_TYPE,
} from 'linx/models/marker';

// creates audio meta with specifications
export default function(options = {}) {
  let gridMarkerStart = Ember.getWithDefault(options, 'gridMarkerStart', 0.15951140261485935);

  let gridMarker = this.factory.make('marker', {
    type: GRID_MARKER_TYPE,
    start: gridMarkerStart
  });

  let audioMeta = this.factory.make('audio-meta', _.defaults(options, {
    duration: 367.47320,
    bpm: 127.961,
    timeSignature: 4,
    key: 11,
    mode: 0,
    loudness: -4.804,
    markers: [gridMarker]
  }));

  return audioMeta;
}
