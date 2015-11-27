import Ember from 'ember';

import PlayableClipMixin from './clip';
import TrackSourceNode from 'linx/lib/web-audio/track-source-node';
import SoundtouchNode from 'linx/lib/web-audio/soundtouch-node';
import GainNode from 'linx/lib/web-audio/gain-node';
import FxNode from 'linx/lib/web-audio/fx-node';
import ReadinessMixin from '../readiness';
import subtract from 'linx/lib/computed/subtract';
import { flatten } from 'linx/lib/utils';

import {
  computedBeatToTime,
  computedBeatToBar,
} from 'linx/models/audio-meta/beat-grid';

export default Ember.Mixin.create(
  PlayableClipMixin,
  ReadinessMixin('isTrackClipReady'), {

  // necessary params
  track: null,
  startBeat: null,
  audioStartBeat: null,
  audioEndBeat: null,

  // implementing readiness
  isTrackClipReady: Ember.computed.and('trackSourceNode.isReady', 'track.isReady'),

  // implement playable-clip
  componentName: 'arrangement-grid/track-clip',
  beatCount: Ember.computed.reads('audioBeatCount'),
  barCount: Ember.computed.reads('audioBarCount'),

  audioMeta: Ember.computed.reads('track.audioMeta'),
  audioBeatGrid: Ember.computed.reads('audioMeta.beatGrid'),
  timeSignature: Ember.computed.reads('audioMeta.timeSignature'),

  audioStartTime: computedBeatToTime('audioBeatGrid', 'audioStartBeat'),
  audioEndTime: computedBeatToTime('audioBeatGrid', 'audioEndBeat'),

  audioStartBar: computedBarToBeat('audioBeatGrid', 'audioStartBeat'),
  audioEndBar: computedBarToBeat('audioBeatGrid', 'audioEndBeat'),

  audioBeatCount: subtract('audioEndBeat', 'audioStartBeat'),
  audioDuration: subtract('audioEndTime', 'audioStartTime'),
  audioBarCount: subtract('audioEndBar', 'audioStartBar'),

  // offset of this clip wrt the audioBeatGrid
  // TODO(REFACTOR): figure out which offset direction is correct
  audioOffset: subtract('audioBeatGrid.firstBarOffset', 'audioStartBeat'),

  // TODO(REFACTOR): need to somehow make sourceNode.playbackRate observe tempo
  // TODO(MULTIGRID): make this depend on ex seekTime and audioBeatGrid.beatScale
  // TODO(MULTIGRID): need to be able to multiply beatgrids together
  audioBpm: Ember.computed.reads('audioMeta.bpm'),
  syncBpm: Ember.computed.reads('metronomeBpm'),
  tempo: Ember.computed('audioBpm', 'syncBpm', function() {
    let audioBpm = this.get('audioBpm');
    let syncBpm = this.get('syncBpm');
    if (Ember.isNone(syncBpm)) {
      return 1;
    } else {
      return syncBpm / audioBpm;
    }
  }),

  getCurrentAudioBeat() {
    let currentClipBeat = this.getCurrentClipBeat();
    let audioStartBeat = this.get('audioStartBeat');
    return currentClipBeat + audioStartBeat;
  },

  getCurrentAudioTime() {
    let currentAudioBeat = this.getCurrentAudioBeat();
    let audioBeatGrid = this.get('audioBeatGrid');
    return audioBeatGrid && audioBeatGrid.beatToTime(currentAudioBeat);
  },

  schedulingDidChange: Ember.observer('audioStartBeat', 'audioBeatCount', function() {
    Ember.run.once(this, 'scheduleStart');
  }).on('schedule'),

  scheduleStart() {
    let metronome = this.get('metronome');
    let when = metronome.beatToTime(this.get('startBeat'));
    let offset = this.getCurrentAudioTime();
    let duration = offset - this.get('audioDuration');
    this.get('trackSourceNode').start(when, offset, duration);
  },

  //
  // Web Audio Nodes
  //
  trackSourceNode: Ember.computed('audioContext', 'track', 'soundtouchNode', function() {
    let { audioContext, track, soundtouchNode } = this.getProperties('audioContext', 'track', 'soundtouchNode');
    return TrackSourceNode.create({ audioContext, track, outputNode: soundtouchNode });
  }),

  soundtouchNode: Ember.computed('audioContext', 'gainNode', function() {
    let { audioContext, gainNode } = this.getProperties('audioContext', 'gainNode');
    return SoundtouchNode.create({ audioContext, outputNode: gainNode });
  }),

  // TODO(REFACTOR): how to distinguish between track gain, fx gain, arrangement gain?
  // TODO(REFACTOR): set GainControl.defaultValue based on track.audioMeta.loudness
  // that might mean making a specific TrackGainNode?
  gainNode: Ember.computed('audioContext', 'fxNode', function() {
    let { audioContext, fxNode } = this.getProperties('audioContext', 'fxNode');
    return GainNode.create({ audioContext, outputNode: fxNode });
  }),

  fxNode: Ember.computed('audioContext', 'outputNode', function() {
    let { audioContext, outputNode } = this.getProperties('audioContext', 'outputNode');
    return FxNode.create({ audioContext, outputNode });
  }),

  nodes: Ember.computed.collect('trackSourceNode', 'soundtouchNode', 'gainNode', 'fxNode'),
  controls: Ember.computed('nodes.@each.controls', function() {
    return flatten(this.get('nodes').mapBy('controls'));
  }),

  destroyNodes() {
    this.get('nodes').map((node) => { return node.destroy(); });
  },

  destroy() {
    this.destroyNodes();
    return this._super.apply(this, arguments);
  },
});
