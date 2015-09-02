import Ember from 'ember';
import RequireAttributes from 'linx/lib/require-attributes';
import cssStyle from 'linx/lib/computed/css-style';
import { flatten, beatToTime } from 'linx/lib/utils';
import _ from 'npm:underscore';

export default Ember.Component.extend(
  RequireAttributes('clip', 'pxPerBeat'), {

    logClearRender: function() {
      console.log("willClearRender");
    }.on('willClearRender'),

  // optional params
  disableMouseInteraction: true,
  syncBpm: null,
  isPlaying: false,
  seekBeat: 0,

  classNames: ['TrackClip'],

  waveSurferStyle: cssStyle({
    'left': 'startPx',
  }),

  actions: {
    didLoadWave: function() {
      this.get('clip').set('isAudioLoaded', true);
    }
  },

  startPx: function() {
    return (this.get('clip.clipStartBeat') * this.get('pxPerBeat')) + 'px';
  }.property('clip.clipStartBeat', 'pxPerBeat'),

  // params
  track: Ember.computed.reads('clip.track'),
  audioStartTime: Ember.computed.reads('clip.audioStartTime'),
  clipEndTime: Ember.computed.reads('clip.clipEndTime'),
  audioBpm: Ember.computed.reads('track.bpm'),
  tempo: function() {
    var audioBpm = this.get('audioBpm');
    var syncBpm = this.get('syncBpm');
    if (Ember.isNone(syncBpm)) {
      return 1;
    } else {
      return syncBpm / audioBpm;
    }
  }.property('audioBpm', 'syncBpm'),

  seekTime: function() {
    return beatToTime(this.get('seekBeat'), this.get('audioBpm'));
  }.property('seekBeat', 'audioBpm'),

  audioSeekTime: function() {
    var seekTime = this.get('seekTime');
    var audioStartTime = this.get('audioStartTime');

    return audioStartTime + seekTime;
  }.property('seekTime', 'audioStartTime'),

  markers: Ember.computed.reads('track.audioMeta.markers'),
  visibleMarkers: function() {
    var audioStartTime = this.get('audioStartTime');
    var clipEndTime = this.get('clipEndTime');

    return this.getWithDefault('markers', []).filter((marker) => {
      var markerStart = marker.get('start');
      return markerStart >= audioStartTime && markerStart <= clipEndTime;
    });
  }.property('audioStartTime', 'clipEndTime', 'markers.[].start'),
});
