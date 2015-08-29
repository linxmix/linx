import Ember from 'ember';
import DS from 'ember-data';
import Clip from './clip';

import { beatToTime } from 'linx/lib/utils';

// Clip that points to a section of an AudioBuffer
export default Clip.extend({
  type: 'audio-clip',

  startBeat: DS.attr('number'), // starting beat in audio
  numBeats: DS.attr('number'), // length of audio-clip, in beats

  endBeat: function() {
    return this.get('startBeat') + this.get('numBeats');
  }.property('startBeat', 'numBeats'),

  // TODO: move isAudioLoaded into ex track.audio.isLoaded?
  isReady: Ember.computed.and('isLoaded', 'isAudioLoaded', 'track.isLoaded', 'track.audioMeta.isLoaded'),
  isAudioLoaded: false,

  // TODO: turn into attrs?
  pitch: function() { return 0; }.property(),
  volume: function() { return 1; }.property(),

  audioMeta: Ember.computed.alias('track.audioMeta'),
  bpm: Ember.computed.alias('audioMeta.bpm'),

  startTime: function() {
    return this.get('audioMeta.firstBeatMarker.start') +
      beatToTime(this.get('startBeat'), this.get('bpm'));
  }.property('audioMeta.firstBeatMarker.start', 'startBeat', 'bpm'),

  lengthTime: function() {
    return beatToTime(this.get('numBeats', this.get('bpm')));
  }.property('bpm', 'numBeats'),

  endTime: function() {
    // TODO: why doesnt lengthTime work?
    return this.get('startTime') + beatToTime(this.get('numBeats'), this.get('bpm'));
  }.property('startTime', 'numBeats', 'bpm'),

  // TODO: turn into section of audioBuffer
  track: DS.belongsTo('track', { async: true }),
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
