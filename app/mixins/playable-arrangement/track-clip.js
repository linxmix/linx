import Ember from 'ember';

import RequireAttributes from 'linx/lib/require-attributes';
import AutomatableClipMixin from './automatable-clip';
import PlayableClipMixin from './clip';
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
  computedTimeToBeat,
  computedBeatToBar,
} from 'linx/models/track/audio-meta/beat-grid';

import {
  default as AutomatableClipControlMixin,
  CONTROL_TYPE_VOLUME,
  CONTROL_TYPE_BPM,
  CONTROL_TYPE_PITCH
} from './automatable-clip/control';

// TODO(CLEANUP): nest under track-clip/controls/gain?
const TrackVolumeControl = Ember.Object.extend(
  AutomatableClipControlMixin('trackVolumeNode.gain'), {

  type: CONTROL_TYPE_VOLUME,
});

const TrackTempoControl = Ember.Object.extend(
  AutomatableClipControlMixin('soundtouchNode.bpm'), {

  type: CONTROL_TYPE_BPM,
});

const TrackPitchControl = Ember.Object.extend(
  AutomatableClipControlMixin('soundtouchNode.pitch'), {

  type: CONTROL_TYPE_PITCH,
});

export default Ember.Mixin.create(
  AutomatableClipMixin,
  PlayableClipMixin,
  ReadinessMixin('isTrackClipReady'), {

  // necessary params
  track: null,
  startBeat: null,
  audioStartTime: null,
  audioEndTime: null,

  // implementing automatable clip mixin
  controls: Ember.computed(function() {
    return [
      TrackVolumeControl.create({ clip: this }),
      TrackTempoControl.create({ clip: this }),
      TrackPitchControl.create({ clip: this })
    ];
  }).readOnly(),

  // implementing readiness
  isTrackClipReady: Ember.computed.and('trackSourceNode.isReady', 'trackSourceNode.isConnected', 'track.isReady'),

  // implement playable-clip
  beatCount: Ember.computed.reads('audioBeatCount'),
  barCount: Ember.computed.reads('audioBarCount'),

  audioMeta: Ember.computed.reads('track.audioMeta'),
  audioBinary: Ember.computed.reads('track.audioBinary'),
  audioBeatGrid: Ember.computed.reads('audioMeta.beatGrid'),
  timeSignature: Ember.computed.reads('audioMeta.timeSignature'),

  audioStartBeat: computedTimeToBeat('audioBeatGrid', 'audioStartTime'),
  audioEndBeat: computedTimeToBeat('audioBeatGrid', 'audioEndTime'),

  audioStartBar: computedBeatToBar('audioBeatGrid', 'audioStartBeat'),
  audioEndBar: computedBeatToBar('audioBeatGrid', 'audioEndBeat'),

  audioBeatCount: subtract('audioEndBeat', 'audioStartBeat'),
  audioDuration: subtract('audioEndTime', 'audioStartTime'),
  audioBarCount: subtract('audioEndBar', 'audioStartBar'),

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
    if (this.get('isScheduled')) {
      // if starting in past, start now instead
      let when = Math.max(this.getAbsoluteTime(), this.getAbsoluteStartTime());
      let offset = this.getCurrentAudioTime();
      let duration = this.get('duration');

      // curate args
      if (offset < 0) {
        when -= offset;
        offset = 0;
      }
      duration -= offset;

      Ember.Logger.log('startTrack', this.get('track.title'), when, offset, duration);
      const node = this.get('soundtouchNode');
      node && node.start(when, offset, duration);
    }
  },

  stopSource: Ember.on('unschedule', function() {
    // Ember.Logger.log('stopTrack', this.get('track.title'));
    const node = this.get('soundtouchNode');
    node && node.stop();
  }),

  //
  // Web Audio Nodes
  //
  // TODO(REFACTOR): how to distinguish between track gain, fx gain, arrangement gain?
  // TODO(REFACTOR): set GainControl.defaultValue based on track.audioMeta.loudness
  // that might mean making a specific TrackGainNode?
  // trackSourceNode: computedObject(TrackSourceNode, {
  //   'audioContext': 'audioContext',
  //   'track': 'track',
  //   'outputNode': 'outputNode.content',
  // }),

  soundtouchNode: computedObject(SoundtouchNode, {
    'audioContext': 'audioContext',
    'audioBuffer': 'audioBinary.audioBuffer',
    'outputNode': 'trackGainNode.content',
  }),

  trackGainNode: computedObject(GainNode, {
    'value': 'audioMeta.gain',
    'audioContext': 'audioContext',
    'outputNode': 'trackVolumeNode.content',
  }),

  trackVolumeNode: computedObject(GainNode, {
    'audioContext': 'audioContext',
    'outputNode': 'outputNode.content',
  }),

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
