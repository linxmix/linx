import Ember from 'ember';

import _ from 'npm:underscore';

import Clip from './clip';

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
  trackBeatCount: Ember.computed.reads('audioMeta.beatCount'),
  trackDuration: Ember.computed.reads('audioMeta.duration'),
  audioBinary: Ember.computed.reads('track.audioBinary'),
  audioBuffer: Ember.computed.reads('audioBinary.audioBuffer'),

  audioStartBeat: Ember.computed.reads('clip.audioStartBeat'),
  audioEndBeat: Ember.computed.reads('clip.audioEndBeat'),
  audioStartTime: Ember.computed.reads('clip.audioStartTime'),
  audioEndTime: Ember.computed.reads('clip.audioEndTime'),
  audioBeatCount: Ember.computed.reads('clip.audioBeatCount'),

  waveTransform: Ember.computed('audioStartBeat', 'pxPerBeat', function() {
    const translateX = this.get('audioStartBeat') * this.get('pxPerBeat');
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

  clipPeaks: Ember.computed('trackPeaks', 'audioStartBeat', 'audioEndBeat', 'pxPerBeat', function() {
    const { trackPeaks, audioStartBeat, audioEndBeat, pxPerBeat } = this.getProperties('trackPeaks', 'audioStartBeat', 'audioEndBeat', 'pxPerBeat');

    console.log('clip peaks 1', Date.now())
    const peaks = (trackPeaks || []).slice(audioStartBeat * pxPerBeat, audioEndBeat * pxPerBeat);
    console.log('clip peaks 2', Date.now())
    console.log('/n')

    return peaks;
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
