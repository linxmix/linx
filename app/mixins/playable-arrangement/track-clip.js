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
  componentName: 'arrangement-grid/track-clip',

  // params
  track: null,
  audioStartBeat: null,
  audioEndBeat: null,

  audioMeta: Ember.computed.reads('track.audioMeta'),
  audioBeatGrid: Ember.computed.reads('audioMeta.beatGrid'),
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

  // offset of this clip wrt the audioBeatGrid
  // TODO(REFACTOR): figure out which offset direction is correct
  audioOffset: subtract('audioBeatGrid.firstBarOffset', 'audioStartBeat'),

  // TODO(REFACTOR): move to track source chain
  trackSourceNode: Ember.computed('track', function() {
    return TrackSourceNode.create({ track: this.get('track') });
  }),
  trackSource: null,
  pitch: 0,
  volume: 1
});
