import Ember from 'ember';
import RequireAttributes from 'linx/lib/require-attributes';
import cssStyle from 'linx/lib/computed/css-style';
import { flatten, beatToTime } from 'linx/lib/utils';
import _ from 'npm:underscore';

export default Ember.Component.extend(
  RequireAttributes('model', 'isPlaying', 'seekBeat', 'pxPerBeat'), {

  classNames: ['TrackClip'],

  waveSurferStyle: cssStyle({
    'left': 'startPx',
  }),

  actions: {
    didLoadWave: function() {
      this.get('model').set('isAudioLoaded', true);
    }
  },

  startPx: function() {
    return (this.get('model.startBeat') * this.get('pxPerBeat')) + 'px';
  }.property('model.startBeat', 'pxPerBeat'),

  // params
  startTime: Ember.computed.alias('model.startTime'),
  endTime: Ember.computed.alias('model.endTime'),
  audioBpm: Ember.computed.alias('model.bpm'),
  disableMouseInteraction: true,
  syncBpm: null,
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
    var startTime = this.get('startTime');
    console.log("audioSeekTime", seekTime + startTime);

    return startTime + seekTime;
  }.property('seekTime', 'startTime'),

  markers: Ember.computed.alias('model.audioMeta.markers'),
  visibleMarkers: function() {
    var startTime = this.get('startTime');
    var endTime = this.get('endTime');

    return this.getWithDefault('markers', []).filter((marker) => {
      var markerStart = marker.get('start');
      return markerStart >= startTime && markerStart <= endTime;
    });
  }.property('startTime', 'endTime', 'markers.@each.start'),
});
