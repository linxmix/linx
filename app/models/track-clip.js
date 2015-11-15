import Ember from 'ember';
import DS from 'ember-data';

import Clip from './clip';
import MixableClipMixin from 'linx/mixins/models/mixable-clip';
import ReadinessMixin from 'linx/mixins/readiness';

import { withDefaultProperty } from 'linx/lib/computed/with-default';
import add from 'linx/lib/computed/add';
import isNumber from 'linx/lib/computed/is-number';
import { variableTernary } from 'linx/lib/computed/ternary';

export default Clip.extend(
  ReadinessMixin('isTrackClipReady'),
  MixableClipMixin, {

  // implementing mixableClip
  model: DS.belongsTo('track', { async: true }),

  firstTrack: Ember.computed.reads('track'),
  lastTrack: Ember.computed.reads('track'),

  // allow custom startBeat within arrangement
  startBeat: variableTernary(
    '_startBeatIsNumber',
    '_startBeat',
    'startBeatInMix'
  ),

  // allow custom audioStartBeat and audioEndBeat
  audioStartBeatWithoutTransition: variableTernary(
    '_audioStartBeatIsNumber',
    '_audioStartBeat',
    'audioMeta.startBeat'
  ),
  audioEndBeatWithoutTransition: variableTernary(
    '_audioEndBeatIsNumber',
    '_audioEndBeat',
    'audioMeta.endBeat'
  ),

  audioStartBeatWithTransition: Ember.computed.reads('prevTransition.toTrackStartBeat'),
  audioEndBeatWithTransition: Ember.computed.reads('nextTransition.fromTrackEndBeat'),

  // implementing Clip
  isTrackClipReady: Ember.computed.and('isAudioLoaded', 'track.isReady'),

  // track-clip specific
  track: Ember.computed.alias('model'),
  audioMeta: Ember.computed.reads('track.audioMeta'),
  _audioStartBeat: DS.attr('number'),
  _audioEndBeat: DS.attr('number'),
  _startBeat: DS.attr('number'),

  _audioStartBeatIsNumber: isNumber('_audioStartBeat'),
  _audioEndBeatIsNumber: isNumber('_audioEndBeat'),
  _startBeatIsNumber: isNumber('_startBeat'),

  // TODO: move isAudioLoaded into ex track.audioSource.isLoaded?
  isAudioLoaded: Ember.computed.reads('track.isAudioLoaded'),

  // TODO: move into FxChainMixin
  pitch: 0,
  volume: 1
});

// TODO: code to copy section of audiobuffer
// var app = {
//  trimBlob : function(params){


// var self = this;
// var start = params.start;
// var end = params.end;

// var originalAudioBuffer;


// originalAudioBuffer = params.wavesurfer.backend.buffer;

// var lengthInSamples = Math.floor( (end - start) *
//   originalAudioBuffer.sampleRate );

// var offlineAudioContext = new webkitOfflineAudioContext(1, 2,
//   originalAudioBuffer.sampleRate );
// var
// new_channel_data,empty_segment_data,original_channel_data,before_data,after_data;

// var emptySegment = offlineAudioContext.createBuffer(
//   originalAudioBuffer.numberOfChannels,lengthInSamples,
//   originalAudioBuffer.sampleRate );

// var newAudioBuffer = offlineAudioContext.createBuffer(
//   originalAudioBuffer.numberOfChannels,
//   (start === 0 ? (originalAudioBuffer.length - emptySegment.length) :
//     originalAudioBuffer.length)
//   , originalAudioBuffer.sampleRate);

// for (var channel = 0; channel < originalAudioBuffer.numberOfChannels;
//   channel++) {

//   new_channel_data = newAudioBuffer.getChannelData(channel);
// empty_segment_data = emptySegment.getChannelData(channel);
// original_channel_data = originalAudioBuffer.getChannelData(channel);

// before_data = original_channel_data.subarray(0, start *
//   originalAudioBuffer.sampleRate);
// after_data = original_channel_data.subarray(Math.floor(end *
//   originalAudioBuffer.sampleRate), (originalAudioBuffer.length *
//   originalAudioBuffer.sampleRate));

// if(start > 0){
//   new_channel_data.set(before_data);
//   new_channel_data.set(empty_segment_data,(start *
//     newAudioBuffer.sampleRate));
//   new_channel_data.set(after_data,(end * newAudioBuffer.sampleRate));
// } else {
//   new_channel_data.set(after_data);
// }

// }

// var arraybuffer = buffer2wav(newAudioBuffer);//Will create a new Blob with
// the IntArray...


// return (new Blob([arraybuffer], { type : 'audio/wav'}));

// }
// }
