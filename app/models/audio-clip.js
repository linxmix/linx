import Ember from 'ember';
import DS from 'ember-data';
import Clip from './clip';

// Clip that points to a section of an AudioBuffer
export default Clip.extend({
  type: Ember.computed(() => { return 'audio-clip' }),

  startBeat: DS.attr('number'), // starting beat in audio
  length: DS.attr('number'), // length of audio-clip, in beats
  endBeat: function() {
    return this.get('startBeat') + this.get('length');
  }.property('startBeat', 'length'),

  // TODO(EASY): figure out what we need to actually be ready.
  //             when audio is loaded and models are ready?
  isReady: Ember.computed.and('isLoaded', 'isAudioLoaded', 'track.isLoaded', 'track.analysis'),
  isAudioLoaded: false,

  // TODO(EASY): turn into attrs?
  pitch: function() { return 0; }.property(),
  volume: function() { return 1; }.property(),

  bpm: Ember.computed.alias('track.bpm'),
  bps: Ember.computed.alias('track.bps'),
  spb: Ember.computed.alias('track.spb'),
  firstBeatStart: Ember.computed.alias('track.firstBeatStart'),
  lengthTime: function() {
    return this.get('spb') * this.get('length');
  }.property('spb', 'length'),
  startTime: function() {
    return this.get('firstBeatStart') + (this.get('startBeat') * this.get('spb'));
  }.property('firstBeatStart', 'startBeat', 'spb'),
  endTime: function() {
    return this.get('startTime') + this.get('lengthTime');
  }.property('startTime', 'lengthTime'),

  arrangementClips: DS.hasMany('arrangement-clip', { async: true }),
  track: DS.belongsTo('track', { async: true }),

  // TODO: deprecated
  file: null,
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
