import Ember from 'ember';

import _ from 'npm:underscore';

import Clip from './clip';
import { timeToBeat as staticTimeToBeat } from 'linx/lib/utils';

export default Clip.extend({
  classNames: ['TrackClip'],

  // optional params
  pxPerBeat: 5,

  call(selection) {
    this._super.apply(this, arguments);
    selection.classed('ArrangementVisualTrackClip', true);
  },

  track: Ember.computed.reads('clip.track'),
  audioMeta: Ember.computed.reads('track.audioMeta'),
  trackBpm: Ember.computed.reads('audioMeta.bpm'),
  trackBeatCount: Ember.computed.reads('audioMeta.beatCount'),
  trackDuration: Ember.computed.reads('audioMeta.duration'),
  audioBinary: Ember.computed.reads('track.audioBinary'),
  audioBuffer: Ember.computed.reads('audioBinary.audioBuffer'),

  audioStartBeat: Ember.computed.reads('clip.audioStartBeat'),
  audioEndBeat: Ember.computed.reads('clip.audioEndBeat'),
  audioStartTime: Ember.computed.reads('clip.audioStartTime'),
  audioEndTime: Ember.computed.reads('clip.audioEndTime'),
  audioBeatCount: Ember.computed.reads('clip.audioBeatCount'),

  waveTransform: Ember.computed('trackBpm', 'audioStartTime', 'pxPerBeat', function() {
    // NOTE: calculate actual raw audio time offset for waveform
    const offsetBeats = -staticTimeToBeat(this.get('audioStartTime'), this.get('trackBpm'));
    const translateX = offsetBeats * this.get('pxPerBeat');
    return `translate(${translateX})`;
  }),

  // TODO(CLEANUP): shouldnt have to depend on audioBuffer
  trackPeaks: Ember.computed('audioBinary', 'audioBuffer', 'pxPerBeat', 'trackBeatCount', 'trackDuration', function() {
    const { audioBinary, audioBuffer, pxPerBeat, trackBeatCount, trackDuration } = this.getProperties('audioBinary', 'audioBuffer', 'pxPerBeat', 'trackBeatCount', 'trackDuration');

    console.log('track clip peaks', this.getProperties('audioBinary', 'audioBuffer', 'pxPerBeat', 'trackBeatCount', 'trackDuration'));
    const peaksLength = trackBeatCount * pxPerBeat;
    const peaks = audioBinary && audioBinary.getPeaks({
      startTime: 0,
      endTime: trackDuration,
      length: peaksLength,

    // scale peaks to track-clip
    }).map((peak, i) => {
      const percent = i / peaksLength;
      const beat = percent * trackBeatCount * pxPerBeat;
      return [beat, peak];
    });

    return peaks || [];
  }),

  markers: Ember.computed.reads('audioMeta.markers'),
  visibleMarkers: Ember.computed('audioStartBeat', 'audioEndBeat', 'markers.@each.beat', function() {
    let audioStartBeat = this.get('audioStartBeat');
    let audioEndBeat = this.get('audioEndBeat');

    return this.getWithDefault('markers', []).filter((marker) => {
      let markerStartBeat = marker.get('beat');
      return markerStartBeat >= audioStartBeat && markerStartBeat <= audioEndBeat;
    });
  }),
});
