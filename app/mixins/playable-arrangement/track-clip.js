import Ember from 'ember';

import RequireAttributes from 'linx/lib/require-attributes';
import AutomatableClipMixin from './automatable-clip';
import TrackSourceNode from 'linx/lib/web-audio/track-source-node';
import GainNode from 'linx/lib/web-audio/gain-node';
import SoundtouchNode from 'linx/lib/web-audio/soundtouch-node';
import FxNode from 'linx/lib/web-audio/fx-node';
import ReadinessMixin from '../readiness';
import subtract from 'linx/lib/computed/subtract';
import multiply from 'linx/lib/computed/multiply';
import computedObject from 'linx/lib/computed/object';
import { flatten } from 'linx/lib/utils';

import {
  computedBeatToTime,
  computedBeatToBar,
} from 'linx/models/track/audio-meta/beat-grid';

import {
  default as AutomatableClipControlMixin,
  CONTROL_TYPE_GAIN
} from './automatable-clip/control';

// TODO(CLEANUP): next under track-clip/controls/gain?
const TrackGainControl = Ember.Object.extend(
  AutomatableClipControlMixin('trackGainNode.gain'), {

  type: CONTROL_TYPE_GAIN,
});

export default Ember.Mixin.create(
  AutomatableClipMixin,
  ReadinessMixin('isTrackClipReady'), {

  // necessary params
  track: null,
  startBeat: null,
  audioStartBeat: null,
  audioEndBeat: null,
  automationClips: null,

  // implementing automatable clip mixin
  controls: Ember.computed(function() {
    return [TrackGainControl.create({ clip: this })];
  }),

  // implementing readiness
  isTrackClipReady: Ember.computed.and('trackSourceNode.isReady', 'trackSourceNode.isConnected', 'track.isReady'),

  // implement playable-clip
  beatCount: Ember.computed.reads('audioBeatCount'),
  barCount: Ember.computed.reads('audioBarCount'),

  audioMeta: Ember.computed.reads('track.audioMeta'),
  audioBeatGrid: Ember.computed.reads('audioMeta.beatGrid'),
  timeSignature: Ember.computed.reads('audioMeta.timeSignature'),

  audioStartTime: computedBeatToTime('audioBeatGrid', 'audioStartBeat'),
  audioEndTime: computedBeatToTime('audioBeatGrid', 'audioEndBeat'),

  audioStartBar: computedBeatToBar('audioBeatGrid', 'audioStartBeat'),
  audioEndBar: computedBeatToBar('audioBeatGrid', 'audioEndBeat'),

  audioBeatCount: subtract('audioEndBeat', 'audioStartBeat'),
  audioDuration: subtract('audioEndTime', 'audioStartTime'),
  audioBarCount: subtract('audioEndBar', 'audioStartBar'),

  // TODO(REFACTOR): need to somehow make sourceNode.playbackRate observe tempo
  // TODO(MULTIGRID): make this depend on ex seekTime and audioBeatGrid.beatScale
  // TODO(MULTIGRID): need to be able to multiply beatgrids together
  audioBpm: Ember.computed.reads('audioMeta.bpm'),
  syncBpm: Ember.computed.reads('metronome.bpm'),
  tempo: Ember.computed('audioBpm', 'syncBpm', function() {
    const audioBpm = this.get('audioBpm');
    const syncBpm = this.get('syncBpm');
    if (Ember.isNone(syncBpm)) {
      return 1;
    } else {
      return syncBpm / audioBpm;
    }
  }),

  getCurrentAudioBeat() {
    const currentClipBeat = this.getCurrentClipBeat();
    const audioStartBeat = this.get('audioStartBeat');
    return currentClipBeat + audioStartBeat;
  },

  getCurrentAudioTime() {
    const currentAudioBeat = this.getCurrentAudioBeat();
    const audioBeatGrid = this.get('audioBeatGrid');
    return audioBeatGrid && audioBeatGrid.beatToTime(currentAudioBeat);
  },

  audioScheduleDidChange: Ember.observer('audioStartBeat', 'audioBeatCount', function() {
    Ember.run.once(this, 'startSource');
  }).on('schedule'),

  startSource() {
    this.stopSource();

    if (this.get('isScheduled')) {
      const when = this.getAbsoluteStartTime();
      const offset = this.getCurrentAudioTime();

      console.log('startTrack', this.get('track.title'), when, offset);
      this.get('trackSourceNode').start(when, offset);
    }
  },

  stopSource: function() {
    // console.log('stopTrack', this.get('track.title'));
    this.get('trackSourceNode').stop();
  }.on('unschedule'),

  //
  // Web Audio Nodes
  //
  // TODO(REFACTOR): how to distinguish between track gain, fx gain, arrangement gain?
  // TODO(REFACTOR): set GainControl.defaultValue based on track.audioMeta.loudness
  // that might mean making a specific TrackGainNode?
  trackSourceNode: computedObject(TrackSourceNode, {
    'audioContext': 'audioContext',
    'track': 'track',
    'outputNode': 'trackGainNode.content',
  }),

  trackGainNode: computedObject(GainNode, {
    'audioContext': 'audioContext',
    'outputNode': 'outputNode.content',
  }),

  // soundtouchNode: computedObject(SoundtouchNode, {
  //   'audioContext': 'audioContext',
  //   'outputNode': 'fxNode',
  // }),

  // fxNode: computedObject(FxNode, {
  //   'audioContext': 'audioContext',
  //   'outputNode': 'outputNode',
  // }),

  // nodes: Ember.computed.collect('trackSourceNode', 'soundtouchNode', 'gainNode', 'fxNode'),
  // controls: Ember.computed('nodes.@each.controls', function() {
  //   return flatten(this.get('nodes').mapBy('controls'));
  // }),

  // destroyNodes() {
  //   this.get('nodes').map((node) => { return node && node.destroy(); });
  // },

  // destroy() {
  //   this.destroyNodes();
  //   return this._super.apply(this, arguments);
  // },

  toString() {
    return '<linx@mixin:playable-arrangement/track-clip>';
  },
});
