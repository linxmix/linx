import Ember from 'ember';

import { join } from 'ember-cli-d3/utils/d3';

import { timeToBeat as staticTimeToBeat } from 'linx/lib/utils';

export default Ember.Mixin.create({

  // required params
  track: null,
  audioStartTime: null,

  // optional params
  displayWaveform: true,
  waveColor: 'green',

  audioMeta: Ember.computed.reads('track.audioMeta'),
  trackBpm: Ember.computed.reads('audioMeta.bpm'),
  trackBeatCount: Ember.computed.reads('audioMeta.beatCount'),
  trackDuration: Ember.computed.reads('audioMeta.duration'),
  audioBinary: Ember.computed.reads('track.audioBinary'),
  audioBuffer: Ember.computed.reads('audioBinary.audioBuffer'),

  // TODO(REFACTOR2): is there a way we  can make this more semantic?
  waveTransform: Ember.computed('trackBpm', 'audioStartTime', 'pxPerBeat', function() {
    // NOTE: calculate actual raw audio time offset for waveform
    const offsetBeats = -staticTimeToBeat(this.get('audioStartTime'), this.get('trackBpm'));
    const translateX = offsetBeats * this.get('pxPerBeat');
    return `translate(${translateX})`;
  }),

  trackPeaks: [],

  // TODO(CLEANUP): shouldnt have to depend on audioBuffer
  trackPeaksDidChange: Ember.observer('audioBinary', 'audioBuffer', 'pxPerBeat', 'trackBeatCount', 'trackDuration', 'displayWaveform', function() {
    Ember.run.once(this, 'updateTrackPeaks');
  }).on('didInsertElement'),

  updateTrackPeaks() {
    // TODO(RONHACK)
    if (!this.get('displayWaveform')) { this.set('trackPeaks', []); return; }

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

    this.set('trackPeaks', peaks || []);
  },

  // TODO(REFACTOR): re-implmement markers
  // audioStartBeat: Ember.computed.reads('clip.audioStartBeat'),
  // audioEndBeat: Ember.computed.reads('clip.audioEndBeat'),
  // audioEndTime: Ember.computed.reads('clip.audioEndTime'),
  // audioBeatCount: Ember.computed.reads('clip.audioBeatCount'),

  // markers: Ember.computed.reads('audioMeta.markers'),
  // visibleMarkers: Ember.computed('audioStartBeat', 'audioEndBeat', 'markers.@each.beat', function() {
  //   let audioStartBeat = this.get('audioStartBeat');
  //   let audioEndBeat = this.get('audioEndBeat');

  //   return this.getWithDefault('markers', []).filter((marker) => {
  //     let markerStartBeat = marker.get('beat');
  //     return markerStartBeat >= audioStartBeat && markerStartBeat <= audioEndBeat;
  //   });
  // }),
});
