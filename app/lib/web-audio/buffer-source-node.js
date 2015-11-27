import Ember from 'ember';

import ReadinessMixin from 'linx/mixins/readiness';
import WebAudioNodeMixin from 'linx/mixins/web-audio/node';
import { isNumber } from 'linx/lib/utils';

export default Ember.Object.extend(
  WebAudioNodeMixin,
  ReadinessMixin('isAudioLoaded'), {

  // implement web-audio/node
  node: null,
  outputNode: null,

  // implmement readiness
  isAudioLoaded: Ember.computed.bool('decodedArrayBuffer'),

  // params
  decodedArrayBuffer: null,

  start(when, offset, duration) {
    // web audio buffer sources can only be played once
    // therefore we must recreate source on each playback
    this.stop();
    let node = this.createBufferSource();
    node.start(when, offset, duration);
  },

  stop() {
    this.disconnect();
  },

  createBufferSource() {
    this.disconnect()
    let audioContext = this.get('audioContext');
    let sourceNode = audioContext.createBufferSource();

    this.set('node', sourceNode);

    this.reloadBuffer();
    this.reconnectOutput();
    return sourceNode;
  },

  reconnectOutput: Ember.observer('outputNode', function() {
    let node = this.get('node');
    let outputNode = this.get('outputNode');

    if (node && outputNode) {
      node.connect(outputNode);
    }
  }),

  reloadBuffer: Ember.observer('decodedArrayBuffer', function() {
    let { sourceNode, decodedArrayBuffer } = this.getProperties('node', 'decodedArrayBuffer');

    if (node && decodedArrayBuffer) {
      node.buffer = decodedArrayBuffer;
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
