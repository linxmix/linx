import Ember from 'ember';

import ClipMixin from './clip';
import TrackSourceNode from 'linx/lib/web-audio/track-source-node';
import ReadinessMixin from '../readiness';
import subtract from 'linx/lib/computed/subtract';

export default Ember.Mixin.create(
  ClipMixin,
  ReadinessMixin('isTrackClipReady'), {

  // implementing readiness
  isTrackClipReady: Ember.computed.and('trackSourceNode.isReady', 'track.isReady'),

  // implement playable-clip
  componentName: 'track-clip',

  // params
  track: null,
  audioStartBeat: null,
  audioEndBeat: null,

  audioMeta: Ember.computed.reads('track.audioMeta'),
  timeSignature: Ember.computed.reads('audioMeta.timeSignature'),
  audioStartBar: Ember.computed('audioStartBeat', 'timeSignature', function() {
    return this.get('audioStartBeat') / this.get('timeSignature');
  }),
  audioEndBar: Ember.computed('audioEndBeat', 'timeSignature', function() {
    return this.get('audioEndBeat') / this.get('timeSignature');
  }),
  audioBeatCount: subtract('audioEndBeat', 'audioStartBeat'),
  audioBarCount: subtract('audioEndBar', 'audioStartBar'),
  beatCount: Ember.computed.reads('audioBeatCount'),
  barCount: Ember.computed.reads('audioBarCount'),

  trackSourceNode: Ember.computed('track', function() {
    return TrackSourceNode.create({ track: this.get('track') });
  }),

  // TODO: move into FxChainMixin.
  pitch: 0,
  volume: 1
});
