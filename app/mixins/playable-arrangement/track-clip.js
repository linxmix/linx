import Ember from 'ember';

import RequireAttributes from 'linx/lib/require-attributes';
import AutomatableClipMixin from './automatable-clip';
import PlayableClipMixin from './clip';
import TrackSourceNode from 'linx/lib/web-audio/track-source-node';
import GainNode from 'linx/lib/web-audio/gain-node';
import TunaDelayNode from 'linx/lib/web-audio/tuna/delay-node';
import TunaFilterNode from 'linx/lib/web-audio/tuna/filter-node';
import SoundtouchNode from 'linx/lib/web-audio/soundtouch-node';
import ReadinessMixin from '../readiness';
import subtract from 'linx/lib/computed/subtract';
import multiply from 'linx/lib/computed/multiply';
import computedObject from 'linx/lib/computed/object';
import { flatten, isValidNumber, beatToTime, bpmToSpb } from 'linx/lib/utils';

import { DEFAULT_GAIN } from 'linx/models/track/audio-meta';
import {
  computedTimeToBeat,
  computedBeatToBar,
} from 'linx/models/track/audio-meta/beat-grid';

import {
  default as AutomatableClipControlMixin,
  CONTROL_TYPE_VOLUME,
  CONTROL_TYPE_PITCH,
  CONTROL_TYPE_DELAY_WET,
  CONTROL_TYPE_DELAY_CUTOFF,
  CONTROL_TYPE_FILTER_HIGHPASS_CUTOFF,
  CONTROL_TYPE_FILTER_LOWPASS_CUTOFF
} from './automatable-clip/control';

// TODO(CLEANUP): nest under track-clip/controls/gain?
const TrackVolumeControl = Ember.Object.extend(
  AutomatableClipControlMixin('trackVolumeNode.gain'), {

  type: CONTROL_TYPE_VOLUME,
  defaultValue: 1,
});

const TrackPitchControl = Ember.Object.extend(
  AutomatableClipControlMixin('soundtouchNode.pitch'), {

  type: CONTROL_TYPE_PITCH,
  defaultValue: 0,
});

const TrackDelayWetControl = Ember.Object.extend(
  AutomatableClipControlMixin('tunaDelayNode.wet.gain'), {

  type: CONTROL_TYPE_DELAY_WET,
  defaultValue: 0,
});

const TrackDelayCutoffControl = Ember.Object.extend(
  AutomatableClipControlMixin('tunaDelayNode.filter.frequency'), {

  type: CONTROL_TYPE_DELAY_CUTOFF,
  defaultValue: 2000,
});

const TrackHighpassFilterCutoffControl = Ember.Object.extend(
  AutomatableClipControlMixin('tunaHighpassFilterNode.filter.frequency'), {

  type: CONTROL_TYPE_FILTER_HIGHPASS_CUTOFF,
  defaultValue: 20,
});

const TrackLowpassFilterCutoffControl = Ember.Object.extend(
  AutomatableClipControlMixin('tunaLowpassFilterNode.filter.frequency'), {

  type: CONTROL_TYPE_FILTER_LOWPASS_CUTOFF,
  defaultValue: 22050,
});


// TODO(REFACTOR2): merge this with arrangement/track-clip model
export default Ember.Mixin.create(
  AutomatableClipMixin,
  PlayableClipMixin,
  ReadinessMixin('isTrackClipReady'), {

  // required params
  track: null,
  startBeat: null,
  audioStartTime: null,
  audioEndTime: null,

  // optional params
  transpose: 0,
  gain: DEFAULT_GAIN,
  delayBypass: false,

  // implementing automatable clip mixin
  controls: Ember.computed(function() {
    return [
      TrackVolumeControl.create({ clip: this }),
      TrackPitchControl.create({ clip: this }),
      TrackDelayWetControl.create({ clip: this }),
      TrackDelayCutoffControl.create({ clip: this }),
      TrackHighpassFilterCutoffControl.create({ clip: this }),
      TrackLowpassFilterCutoffControl.create({ clip: this })
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
  audioBpm: Ember.computed.reads('audioMeta.bpm'),

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

  // given a beat in arrangement frame of reference, calculate corresponding time in this clip's audio
  getAudioTimeFromArrangementBeat(arrangementBeat) {
    const audioBeatGrid = this.get('audioBeatGrid');

    const clipBeat = arrangementBeat - this.get('startBeat');
    const audioStartBeat = this.get('audioStartBeat');
    return audioBeatGrid.beatToTime(audioStartBeat + clipBeat);
  },

  // TODO(V2): dynamic tempo
  audioScheduleDidChange: Ember.observer('audioBinary.isReady', 'audioStartBeat', 'audioBeatCount', 'tempo', 'transpose', 'gain', function() {
    Ember.run.once(this, 'startSource');
  }).on('schedule'),

  tempo: Ember.computed('syncBpm', 'audioBpm', function() {
    const syncBpm = this.get('syncBpm');
    const audioBpm = this.get('audioBpm');

    return (isValidNumber(syncBpm) && isValidNumber(audioBpm)) ? (syncBpm / audioBpm) : 1;
  }),

  startSource() {
    if (this.get('isScheduled') && this.get('audioBinary.isReady')) {
      const { tempo, transpose } = this.getProperties('tempo', 'transpose');
      // if starting in past, start now instead
      let startTime = Math.max(this.getAbsoluteTime(), this.getAbsoluteStartTime());
      let offsetTime = this.getCurrentAudioTime();
      const endTime = this.getAbsoluteEndTime();

      // curate args
      if (offsetTime < 0) {
        startTime -= offsetTime;
        offsetTime = 0;
      }

      Ember.Logger.log('startTrack', this.get('track.title'), startTime, offsetTime, endTime, tempo, transpose);
      const node = this.get('soundtouchNode');
      node && node.start(startTime, offsetTime, endTime, tempo, transpose);
    } else {
      this.stopSource();
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
    'value': 'gain',
    'audioContext': 'audioContext',
    'outputNode': 'trackVolumeNode.content',
  }),

  trackVolumeNode: computedObject(GainNode, {
    'audioContext': 'audioContext',
    'outputNode': 'tunaDelayNode.content',
  }),

  quarterNoteDelayTime: Ember.computed('syncBpm', function() {
    // return bpmToSpb(this.get('syncBpm')) * 1000 * 3 / 4;
    return bpmToSpb(this.get('syncBpm')) * 1000;
  }),

  tunaDelayNode: computedObject(TunaDelayNode, {
    'bypass': 'delayBypass',
    'delayTime': 'quarterNoteDelayTime',
    'audioContext': 'audioContext',
    'outputNode': 'tunaHighpassFilterNode.content',
  }),

  highpassFilterType: 'highpass',
  tunaHighpassFilterNode: computedObject(TunaFilterNode, {
    'filterType': 'highpassFilterType',
    'frequency': 20,
    'audioContext': 'audioContext',
    'outputNode': 'tunaLowpassFilterNode.content',
  }),

  lowpassFilterType: 'lowpass',
  tunaLowpassFilterNode: computedObject(TunaFilterNode, {
    'filterType': 'lowpassFilterType',
    'frequency': 22050,
    'audioContext': 'audioContext',
    'outputNode': 'outputNode.content',
  }),

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
