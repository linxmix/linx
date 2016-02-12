import Ember from 'ember';

import _ from 'npm:underscore';

import Clip from './clip';

export default Clip.extend({
  classNames: ['TrackClip'],

  // optional params
  // TODO(REFACTOR): make this vary on isInView and pxPerBeat. zoom in if clip is in viewport?
  audioPxPerBeat: 20,

  track: Ember.computed.reads('clip.track'),
  audioMeta: Ember.computed.reads('track.audioMeta'),
  audioBinary: Ember.computed.reads('track.audioBinary'),
  audioBuffer: Ember.computed.reads('audioBinary.audioBuffer'),

  audioStartBeat: Ember.computed.reads('clip.audioStartBeat'),
  audioEndBeat: Ember.computed.reads('clip.audioEndBeat'),
  audioStartTime: Ember.computed.reads('clip.audioStartTime'),
  audioEndTime: Ember.computed.reads('clip.audioEndTime'),
  audioBeatCount: Ember.computed.reads('clip.audioBeatCount'),

  // TODO(CLEANUP): shouldnt have to depend on audioBuffer
  peaks: Ember.computed('audioBinary', 'audioBuffer', 'audioStartTime', 'audioEndTime', 'audioBeatCount', 'audioPxPerBeat', function() {
    const { audioBinary, audioStartTime, audioEndTime, audioBeatCount, audioPxPerBeat } = this.getProperties('audioBinary', 'audioStartTime', 'audioEndTime', 'audioBeatCount', 'audioPxPerBeat');

    // console.log('track clip peaks', this.getProperties('audioBuffer', 'audioStartTime', 'audioEndTime', 'audioBeatCount', 'audioPxPerBeat'))
    const peaksLength = audioBeatCount * audioPxPerBeat;
    const peaks = audioBinary && audioBinary.getPeaks({
      startTime: audioStartTime,
      endTime: audioEndTime,
      length: peaksLength,

    // scale peaks to track-clip
    }).map((peak, i) => {
      const percent = i / peaksLength;
      const beat = percent * audioBeatCount;
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
