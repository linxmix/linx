/* global SoundTouch:true */
/* global FifoSampleBuffer:true */
/* global SimpleFilter:true */

import AudioWorkerNode from 'npm:audio-worker-node';

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

export function createSoundtouchNode(audioContext, filter, when, offset, duration) {
  // const node = audioContext.createScriptProcessor(BUFFER_SIZE, 2, 2);

  const samples = new Float32Array(BUFFER_SIZE * 2);

  const sampleRate = audioContext.sampleRate;
  const startSample = ~~(offset * sampleRate);
  let endSample;
  if (isValidNumber(duration)) {
    endSample = startSample + ~~(duration * sampleRate);
  }

  filter.sourcePosition = startSample;

  function onaudioprocess({
    type,
    inputs,
    outputs,
    parameters,
    playbackTime,
    node,
  }) {
    // outputs is array of arrays of outputs
    const l = outputs[0][0];
    const r = outputs[0][1];

    if (audioContext.currentTime >= when) {
      let bufferSize = l.length;

      // naively take first pitch and tempo values for this sample
      const pitch = parameters.pitch && parameters.pitch[0];
      const tempo = parameters.tempo && parameters.tempo[0];
      const soundtouch = filter.pipe;

      if (isValidNumber(pitch)) {
        soundtouch.pitchSemitones = pitch;
      }
      if (isValidNumber(tempo)) {
        soundtouch.tempo = tempo;
      }

      // do not extract past endSample
      const currentSample = filter.sourcePosition;
      const lastSample = currentSample + BUFFER_SIZE;

      if ((isValidNumber(endSample)) && (lastSample > endSample)) {
        bufferSize -= lastSample - endSample;
        bufferSize = Math.min(0, bufferSize);
      }

      const framesExtracted = bufferSize > 0 ? filter.extract(samples, bufferSize) : 0;
      if (framesExtracted === 0) {
        // Ember.Logger.log("zero frames extracted", startSample, endSample, lastSample);
      }

      // fill output with extracted values
      for (let i = 0; i < framesExtracted; i++) {
        l[i] = samples[i * 2];
        r[i] = samples[i * 2 + 1];
      }

      // fill rest of output with empty values
      for (let i = framesExtracted; i < BUFFER_SIZE; i++) {
        l[i] = 0;
        r[i] = 0;
      }
    }
  };

  const node = new AudioWorkerNode(audioContext, onaudioprocess, {
    numberOfInputs: 2,
    numberOfOutputs: 2,
    bufferLength: BUFFER_SIZE,
    parameters: [
      {
        name: 'pitch',
        defaultValue: 0,
      },
      {
        name: 'tempo',
        defaultValue: 1,
      }
    ],
  });

  return node;
}

export var SoundtouchFilter = SimpleFilter;

export default SoundTouch;
