import Ember from 'ember';

import _ from 'npm:underscore';

import RequireAttributes from 'linx/lib/require-attributes';

import { computedBeatToTime } from 'linx/models/track/audio-meta/beat-grid';
import { default as cssStyle, animateStyle } from 'linx/lib/computed/css-style';
import add from 'linx/lib/computed/add';
import multiply from 'linx/lib/computed/multiply';
import toPixels from 'linx/lib/computed/to-pixels';
import { variableTernary } from 'linx/lib/computed/ternary';
import { flatten } from 'linx/lib/utils';

export default Ember.Component.extend({
  classNames: ['ArrangementGridTrackClip'],

  // params
  track: Ember.computed.reads('clip.track'),
  audioStartBeat: Ember.computed.reads('clip.audioStartBeat'),
  audioEndBeat: Ember.computed.reads('clip.audioEndBeat'),
  audioMeta: Ember.computed.reads('track.audioMeta'),

  waveStyle: cssStyle({
    'left': 'waveOffsetStyle',
  }),

  // visually align the segment of audio represented by this clip
  // TODO(REFACTOR): figure out which offset direction is correct
  waveOffset: multiply('clip.audioOffset', 'pxPerBeat', -1.0),
  waveOffsetStyle: toPixels('waveOffset'),

  markers: Ember.computed.reads('audioMeta.markers'),
  visibleMarkers: Ember.computed('audioStartBeat', 'audioEndBeat', 'markers.@each.startBeat', function() {
    let audioStartBeat = this.get('audioStartBeat');
    let audioEndBeat = this.get('audioEndBeat');

    return this.getWithDefault('markers', []).filter((marker) => {
      let markerStartBeat = marker.get('startBeat');
      return markerStartBeat >= audioStartBeat && markerStartBeat <= audioEndBeat;
    });
  }),
});
