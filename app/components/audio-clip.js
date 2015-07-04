import Ember from 'ember';
import RequireAttributes from 'linx/lib/require-attributes';
import cssStyle from 'linx/lib/computed/css-style';

export default Ember.Component.extend(
  RequireAttributes('model', 'isPlaying', 'seekTime', 'pxPerBeat'), {

  classNames: ['AudioClip'],

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
  audioBpm: Ember.computed.alias('model.bpm'),
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

  audioSeekTime: function() {
    var seekTime = this.get('seekTime');
    var startTime = this.get('model.startTime');
    // console.log("audioSeekTime", seekTime, startTime);

    return startTime + seekTime;
  }.property('seekTime', 'model.startTime'),
});
