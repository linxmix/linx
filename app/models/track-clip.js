import Ember from 'ember';
import DS from 'ember-data';

import Clip from './clip';
import MixableClipMixin from 'linx/mixins/models/mixable-clip';

import { beatToTime } from 'linx/lib/utils';
import { withDefaultProperty } from 'linx/lib/computed/with-default';

export default Clip.extend(MixableClipMixin, {
  // type: 'track-clip',

  // implementing mixableClip
  model: DS.belongsTo('track', { async: true }),

  firstTrack: Ember.computed.reads('track'),
  lastTrack: Ember.computed.reads('track'),

  clipStartBeatWithoutTransition: Ember.computed.reads('track.audioMeta.firstBeat'),
  clipEndBeatWithoutTransition: Ember.computed.reads('track.audioMeta.lastBeat'),

  clipStartBeatWithTransition: Ember.computed.reads('prevTransition.toTrackStartBeat'),
  clipEndBeatWithTransition: Ember.computed.reads('nextTransition.fromTrackEndBeat'),

  // implementing Clip
  isValid: Ember.computed.and('track.content', 'isValidNumBeats'),
  numBeats: withDefaultProperty('_numBeats', 'numBeatsClip'),
  isReady: Ember.computed.and('isLoaded', 'isAudioLoaded', 'track.isLoaded', 'track.audioMeta.isLoaded'),

  // track-clip specific
  track: Ember.computed.alias('model'),
  _audioStartBeat: DS.attr('number'),
  _numBeats: DS.attr('number'),
  _audioEndBeat: DS.attr('number'),

  audioStartBeat: withDefaultProperty('_audioStartBeat', 'clipStartBeat'),
  audioEndBeat: withDefaultProperty('_audioEndBeat', 'clipEndBeat'),

  // TODO: move isAudioLoaded into ex track.audio.isLoaded?
  isAudioLoaded: false,

  // TODO: move into FxChainMixin
  pitch: 0,
  volume: 1,

  audioMeta: Ember.computed.reads('track.audioMeta'),
  bpm: Ember.computed.reads('audioMeta.bpm'),

  audioStartTime: function() {
    return this.get('audioMeta.firstBeatMarker.start') +
      beatToTime(this.get('audioStartBeat'), this.get('bpm'));
  }.property('audioMeta.firstBeatMarker.start', 'audioStartBeat', 'bpm'),

  audioLength: function() {
    return beatToTime(this.get('numBeats', this.get('bpm')));
  }.property('bpm', 'numBeats'),

  audioEndTime: function() {
    // TODO: why doesnt audioLength work?
    return this.get('audioStartTime') + beatToTime(this.get('numBeats'), this.get('bpm'));
  }.property('audioStartTime', 'numBeats', 'bpm'),
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
