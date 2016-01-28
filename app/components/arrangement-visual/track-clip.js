import Ember from 'ember';

import _ from 'npm:underscore';

import Clip from './clip';

export default Clip.extend({
  classNames: ['TrackClip'],

  // optional params
  audioResolution: 40, // number o

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
  peaks: Ember.computed('audioBuffer', 'audioStartTime', 'audioEndTime', 'audioBeatCount', 'audioResolution', function() {
    let audioBinary = this.get('audioBinary');
    console.log('track clip peaks', this.getProperties('audioBuffer', 'audioStartTime', 'audioEndTime', 'audioBeatCount', 'audioResolution'))
    return (audioBinary && audioBinary.getPeaks(
      this.get('audioStartTime'),
      this.get('audioEndTime'),
      this.get('audioBeatCount') * this.get('audioResolution')
    )) || [];
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
