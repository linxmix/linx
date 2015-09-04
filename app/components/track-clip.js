import Ember from 'ember';
import RequireAttributes from 'linx/lib/require-attributes';
import cssStyle from 'linx/lib/computed/css-style';
import add from 'linx/lib/computed/add';
import { flatten, beatToTime } from 'linx/lib/utils';
import _ from 'npm:underscore';

export default Ember.Component.extend(
  RequireAttributes('clip', 'pxPerBeat'), {

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
  audioBpm: Ember.computed.reads('track.audioMeta.bpm'),
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
    console.log('update seekTime', this.get('seekBeat'));
    return beatToTime(this.get('seekBeat'), this.get('audioBpm'));
  }.property('seekBeat', 'audioBpm'),

  seekBeatDidChange: function() {
    console.log("seekBeatDidChange", this.get('seekBeat'))
    // let seekTime = beatToTime(this.get('seekBeat'), this.get('audioBpm'));
    // this.set('audioSeekTime', seekTime + this.get('audioStartTime'));
    // this.set('seekTime', beatToTime(this.get('seekBeat'), this.get('audioBpm')));
  }.observes('seekBeat'),

  // audioSeekTime: add('seekTime', 'audioStartTime'),
  audioSeekTime: function() {
    console.log('update audioSeekTime', this.get('seekTime'));
    return this.get('seekTime') + this.get('audioStartTime');
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
