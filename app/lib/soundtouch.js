/* global SoundTouch:true */
/* global FifoSampleBuffer:true */

import RequireAttributes from 'linx/lib/require-attributes';

// Augment SoundTouch
SoundTouch.prototype.clearBuffers = function() {
  this.inputBuffer.clear();
  this._intermediateBuffer.clear();
  this.outputBuffer.clear();
};

// fix bug (?)
SoundTouch.prototype.getSampleReq = function() {
  return this.tdStretch.sampleReq;
};

// fix bug by adding `this.`
SoundTouch.prototype.clear = function() {
  this.rateTransposer.clear();
  this.tdStretch.clear();
};

// fix bug by adding `this.`
FifoSampleBuffer.prototype.clear = function() {
  this.receive(this.frameCount);
  this.rewind();
};


//
//  Add SoundTouch + Web Audio integration. exposes:
//  [class] SoundTouch()
//  [class] WebAudioBufferSource(buffer)
//  [function] getWebAudioNode(audioContext, source)
//
const BUFFER_SIZE = 16384 / 8;

function WebAudioBufferSource(buffer) {
  this.buffer = buffer;
}

WebAudioBufferSource.prototype = {
  extract: function(target, numFrames, position) {
    var l = this.buffer.getChannelData(0);
    var r = this.buffer.getChannelData(1);
    for (var i = 0; i < numFrames; i++) {
      target[i * 2] = l[i + position];
      target[i * 2 + 1] = r[i + position];
    }
    return Math.min(numFrames, l.length - position);
  }
};

function getWebAudioNode(audioContext, source) {
  var node = audioContext.createScriptProcessor(BUFFER_SIZE, 2, 2);
  var samples = new Float32Array(BUFFER_SIZE * 2);

  node.onaudioprocess = function(e) {
  // TODO(WEBWORKER): handle in web worker. will be possible with AudioWorkerNode
    var l = e.outputBuffer.getChannelData(0);
    var r = e.outputBuffer.getChannelData(1);
    var framesExtracted = source.extract(samples, BUFFER_SIZE);
    if (framesExtracted === 0) {
      console.log("zero frames extracted");
    }
    for (var i = 0; i < framesExtracted; i++) {
      l[i] = samples[i * 2];
      r[i] = samples[i * 2 + 1];
    }
  };
  return node;
}

export var WebAudioBufferSource;
export var getWebAudioNode;
export default SoundTouch;
