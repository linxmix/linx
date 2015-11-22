import Ember from 'ember';

import ReadinessMixin from 'linx/mixins/readiness';
import WebAudioNodeMixin from 'linx/mixins/web-audio/node';
import { isNumber } from 'linx/lib/utils';

export default Ember.Object.extend(
  WebAudioNodeMixin,
  ReadinessMixin('isAudioLoaded'), {

  // params
  isAudioLoaded: Ember.computed.bool('decodedArrayBuffer'),
  decodedArrayBuffer: null,
  isPlaying: false,
  seekTime: 0,

  playStateDidChange: Ember.observer('sourceNode', 'isPlaying', 'seekTime', function() {
    Ember.run.once(this, 'updateSourceNode');
  }),

  // TODO(REFACTOR): isolate this audio source logic
  updateSourceNode() {
    let { isPlaying, seekTime, sourceNode } = this.getProperties('sourceNode', 'isPlaying', 'seekTime');

    if (sourceNode) {
      let currentTime = this.getCurrentAudioTime();
      console.log("updateSourceNode", isPlaying, currentTime, this.get('track.title'));

      if (isPlaying) {
        sourceNode.play(currentTime);
      } else {
        sourceNode.pause();
      }

      // TODO(REFACTOR): is this necessary?
      // if playing, only seek if seekTime and currentTime have diverged
      // if (!isPlaying || Math.abs(seekTime - currentTime) >= 0.01) {
      //   wavesurfer.seekToTime(seekTime);
      // }
    }
  },

  // web audio buffer sources can only be played once
  // therefore we must recreate source on each playback
  play(time) {
    if (this.get('isPlaying'))
    let sourceNode = this.createSourceNode();
    if (isNumber(time)) {
      this.seekToBeat(time);
    }

    let sourceNode = this.get('sourceNode');
    this.set('isPlaying', true);
  },

  pause() {
  },

  setPlaybackRate(rate) {

  },

  // implement web-audio/node
  node: Ember.computed.reads('sourceNode'),
  sourceNode: null,

  createSourceNode() {
    this.destroyNode()
    let audioContext = this.get('audioContext')
    let sourceNode = audioContext.createBufferSource();
    this.set('sourceNode', sourceNode);
    this.reloadSourceNode();
    return sourceNode;
  },

  resetSource: function () {
      this.disconnectSource();
      this.source = this.ac.createBufferSource();

      //adjust for old browsers.
      this.source.start = this.source.start || this.source.noteGrainOn;
      this.source.stop = this.source.stop || this.source.noteOff;

      this.source.playbackRate.value = this.playbackRate;
      this.source.buffer = this.buffer;
      this.source.connect(this.analyser);
  },

  reloadSourceNode: Ember.observer('decodedArrayBuffer', function() {
    let { sourceNode, decodedArrayBuffer } = this.getProperties('sourceNode', 'decodedArrayBuffer');

    if (sourceNode && decodedArrayBuffer) {
      sourceNode.buffer = decodedArrayBuffer;
    }
  }),
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
