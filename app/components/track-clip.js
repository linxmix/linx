import Ember from 'ember';

import _ from 'npm:underscore';

import RequireAttributes from 'linx/lib/require-attributes';
import Clip from './clip';

import cssStyle from 'linx/lib/computed/css-style';
import add from 'linx/lib/computed/add';
import { flatten, beatToTime } from 'linx/lib/utils';

export default Clip.extend({
  actions: {
    waveDidLoad: function() {
      this.get('clip').set('isAudioLoaded', true);
    },
  },

  // optional params
  disableMouseInteraction: true,

  classNames: ['TrackClip'],

  waveSurferStyle: cssStyle({
    'left': 'startPx',
  }),

  startPx: function() {
    return (this.get('clip.clipStartBeat') * this.get('pxPerBeat')) + 'px';
  }.property('clip.clipStartBeat', 'pxPerBeat'),

  // params
  track: Ember.computed.reads('model'),
  audioStartTime: Ember.computed.reads('clip.audioStartTime'),
  audioEndTime: Ember.computed.reads('clip.audioEndTime'),
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
    if (this.get('isFinished')) {
      return this.get('audioEndTime');
    } else {
      return beatToTime(this.get('seekBeat'), this.get('audioBpm'));
    }
  }.property('seekBeat', 'isFinished', 'audioEndTime'),

  audioSeekTime: add('seekTime', 'audioStartTime'),

  markers: Ember.computed.reads('track.audioMeta.markers'),
  visibleMarkers: function() {
    var audioStartTime = this.get('audioStartTime');
    var audioEndTime = this.get('audioEndTime');

    return this.getWithDefault('markers', []).filter((marker) => {
      var markerStart = marker.get('start');
      return markerStart >= audioStartTime && markerStart <= audioEndTime;
    });
  }.property('audioStartTime', 'audioEndTime', 'markers.@each.start'),
});
