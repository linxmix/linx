/* global SoundTouch:true */
/* global FifoSampleBuffer:true */
/* global SimpleFilter:true */
import Ember from 'ember';

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
//  [function] createSoundtouchScriptNode(audioContext, filter, when, offset, endTime)
//
const MAX_BUFFER_SIZE = 16384;
const BUFFER_SIZE = MAX_BUFFER_SIZE / 16;
const SAMPLE_DRIFT_TOLERANCE = 512;

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

export function createSoundtouchNode({ audioContext, filter, startTime, offsetTime, endTime, defaultTempo, defaultPitch }) {
  const channelCount = 2;

  if (!(audioContext && filter
    && isValidNumber(startTime) && isValidNumber(offsetTime) && isValidNumber(endTime))) {
    Ember.Logger.warn('Must provide all params to createSoundtouchNode', endTime);
    return;
  }

  const samples = new Float32Array(BUFFER_SIZE * channelCount);
  const sampleRate = audioContext.sampleRate || 44100;
  const startSample = ~~(offsetTime * sampleRate);

  filter.sourcePosition = startSample;

  const filterStartPosition = filter.position;

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

    // calculate how many frames to extract based on isPlaying
    const isPlaying = parameters.isPlaying || [];
    const bufferSize = l.length;

    let extractFrameCount = 0;
    for (let i = 0; i < isPlaying.length; i++) {
      extractFrameCount += isPlaying[i];
    }

    // if playing, calculate expected vs actual position
    if (extractFrameCount !== 0) {
      const actualElapsedSamples = Math.max(0, filter.position - filterStartPosition + extractFrameCount);
      const elapsedTime = Math.min(audioContext.currentTime, endTime) - startTime;
      const expectedElapsedSamples = Math.max(0, elapsedTime * sampleRate);
      const sampleDelta = ~~(expectedElapsedSamples - actualElapsedSamples);

      // if we've drifed past tolerance, adjust frames to extract
      if (Math.abs(sampleDelta) >= SAMPLE_DRIFT_TOLERANCE) {

        console.log("DRIFT", sampleDelta, extractFrameCount, BUFFER_SIZE);
        // console.log('actualElapsedSamples', actualElapsedSamples);
        // console.log('expectedElapsedSamples', expectedElapsedSamples);

        // if we're behind where we should be, extract dummy frames to catch up
        if (sampleDelta > 0) {
          const dummySamples = new Float32Array(sampleDelta * channelCount);
          const dummyFramesExtracted = filter.extract(dummySamples, sampleDelta);

        // if we're ahead of where we should be, rewind
        } else if (sampleDelta < 0) {
          filter.position += sampleDelta;
        }
      }
    }


    const framesExtracted = extractFrameCount > 0 ? filter.extract(samples, extractFrameCount) : 0;

    // map extracted frames onto output
    let filterFrame = 0;
    for (let i = 0; i < bufferSize; i++) {
      l[i] = (samples[filterFrame * 2] * isPlaying[i]) || 0;
      r[i] = (samples[filterFrame * 2 + 1] * isPlaying[i]) || 0;
      filterFrame += isPlaying[i];
    }
  };

  defaultPitch = parseFloat(defaultPitch);
  defaultPitch = isValidNumber(defaultPitch) ? defaultPitch : 0;

  defaultTempo = parseFloat(defaultTempo);
  defaultTempo = isValidNumber(defaultTempo) ? defaultTempo : 1;

  const node = new AudioWorkerNode(audioContext, onaudioprocess, {
    numberOfInputs: 2,
    numberOfOutputs: 2,
    bufferLength: BUFFER_SIZE,
    dspBufLength: BUFFER_SIZE,
    parameters: [
      {
        name: 'pitch',
        defaultValue: defaultPitch,
      },
      {
        name: 'tempo',
        defaultValue: defaultTempo,
      },
      {
        name: 'isPlaying',
        defaultValue: 0,
      }
    ],
  });

  // schedule node start and end
  if (endTime > audioContext.currentTime) {
    node.isPlaying.setValueAtTime(1, startTime);
    node.isPlaying.setValueAtTime(0, endTime);
  }

  return node;
}

export var SoundtouchFilter = SimpleFilter;

export default SoundTouch;
