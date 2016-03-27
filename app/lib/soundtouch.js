/* global SoundTouch:true */
/* global FifoSampleBuffer:true */
/* global SimpleFilter:true */

import { isValidNumber } from 'linx/lib/utils';

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
//  [class] SoundtouchBufferSource(buffer)
//  [function] createSoundtouchScriptNode(audioContext, filter, when, offset, duration)
//
const BUFFER_SIZE = 16384 / 8;

export function SoundtouchBufferSource(buffer) {
  this.buffer = buffer;
}

SoundtouchBufferSource.prototype = {
  extract: function(target, numFrames, position) {
    const l = this.buffer.getChannelData(0);
    const r = this.buffer.getChannelData(1);
    for (let i = 0; i < numFrames; i++) {
      target[i * 2] = l[i + position];
      target[i * 2 + 1] = r[i + position];
    }
    return Math.min(numFrames, l.length - position);
  }
};

export function createSoundtouchScriptNode(audioContext, filter, when, offset, duration) {
  const node = audioContext.createScriptProcessor(BUFFER_SIZE, 2, 2);
  const samples = new Float32Array(BUFFER_SIZE * 2);

  const sampleRate = audioContext.sampleRate;
  const startSample = ~~(offset * sampleRate);
  let endSample;
  if (isValidNumber(duration)) {
    endSample = startSample + ~~(duration * sampleRate);
  }

  filter.sourcePosition = startSample;

  // TODO(WEBWORKER): handle in web worker. will be possible with AudioWorkerNode
  node.onaudioprocess = function(e) {
    const l = e.outputBuffer.getChannelData(0);
    const r = e.outputBuffer.getChannelData(1);

    if (audioContext.currentTime >= when) {

      // do not extract past endSample
      const currentSample = filter.sourcePosition;
      const lastSample = currentSample + BUFFER_SIZE;

      let bufferSize = BUFFER_SIZE;
      if ((isValidNumber(endSample)) && (lastSample > endSample)) {
        bufferSize -= lastSample - endSample;
        bufferSize = Math.min(0, bufferSize);
      }

      const framesExtracted = filter.extract(samples, bufferSize);
      if (framesExtracted === 0) {
        Ember.Logger.log("zero frames extracted", startSample, endSample, lastSample);
      }
      for (let i = 0; i < framesExtracted; i++) {
        l[i] = samples[i * 2];
        r[i] = samples[i * 2 + 1];
      }
    }
  };

  return node;
}

export var SoundtouchFilter = SimpleFilter;

export default SoundTouch;
