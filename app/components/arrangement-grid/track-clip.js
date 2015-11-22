import Ember from 'ember';

import _ from 'npm:underscore';

import RequireAttributes from 'linx/lib/require-attributes';
import ClipPlayerMixin from 'linx/mixins/arrangement-player/clip';

import { computedBeatToTime } from 'linx/models/track/audio-meta/beat-grid';
import { default as cssStyle, animateStyle } from 'linx/lib/computed/css-style';
import add from 'linx/lib/computed/add';
import multiply from 'linx/lib/computed/multiply';
import toPixels from 'linx/lib/computed/to-pixels';
import { variableTernary } from 'linx/lib/computed/ternary';
import { flatten } from 'linx/lib/utils';

export default Ember.Component.extend(
  ClipPlayerMixin, {

  classNames: ['ArrangementGridTrackClip'],

  // params
  track: Ember.computed.reads('clip.track'),
  audioStartBeat: Ember.computed.reads('clip.audioStartBeat'),
  audioEndBeat: Ember.computed.reads('clip.audioEndBeat'),

  audioMeta: Ember.computed.reads('track.audioMeta'),
  audioBeatGrid: Ember.computed.reads('audioMeta.beatGrid'),

  //
  // Playback Logic
  //
  // TODO(MULTIGRID): make this depend on ex seekTime and audioBeatGrid.beatScale
  audioBpm: Ember.computed.reads('audioMeta.bpm'),
  tempo: Ember.computed('audioBpm', 'syncBpm', function() {
    let audioBpm = this.get('audioBpm');
    let syncBpm = this.get('syncBpm');
    if (Ember.isNone(syncBpm)) {
      return 1;
    } else {
      return syncBpm / audioBpm;
    }
  }),

  audioSeekBeat: add('seekBeat', 'audioStartBeat'), // align event seekBeat to audio
  audioSeekTime: computedBeatToTime('audioBeatGrid', 'audioSeekBeat'),

  getCurrentAudioBeat() {
    let currentEventBeat = this.getCurrentEventBeat();
    let audioStartBeat = this.get('audioStartBeat');
    return currentEventBeat + audioStartBeat;
  },

  getCurrentAudioTime() {
    let currentAudioBeat = this.getCurrentAudioBeat();
    let audioBeatGrid = this.get('audioBeatGrid');
    return audioBeatGrid && audioBeatGrid.beatToTime(currentAudioBeat);
  },

  trackSource: Ember.computed.reads('clip.trackSource'),
  updateTrackSource: Ember.observer('trackSource', 'isPlaying', 'seekTime', 'tempo', function() {
    let { isPlaying, trackSource, tempo } = this.getProperties('trackSource', 'isPlaying', 'tempo');
    let seekTime = this.getCurrentAudioTime();

    trackSource && trackSource.setProperties({
      isPlaying,
      seekTime,
      tempo
    });
  }),

  //
  // View Logic
  //
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
