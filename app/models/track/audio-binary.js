/* global Parallel:true */
/* global DSPJS:true */
import Ember from 'ember';
import DS from 'ember-data';

import { task } from 'ember-concurrency';

import ENV from 'linx/config/environment';
import RequireAttributes from 'linx/lib/require-attributes';
import { isValidNumber, asResolvedPromise } from 'linx/lib/utils';
import ReadinessMixin from 'linx/mixins/readiness';
import Ajax from 'linx/lib/ajax';

const FFT_BUFFER_SIZE = 2048;

export default Ember.Object.extend(
  ReadinessMixin('isArrayBufferLoadedAndDecoded'),
  RequireAttributes('track'), {

  file: Ember.computed.reads('track.file'),
  isLoading: Ember.computed.or('arrayBuffer.isPending', 'decodedArrayBuffer.isPending'),
  isEmpty: Ember.computed.not('arrayBuffer'),

  // implement readiness
  isArrayBufferLoadedAndDecoded: Ember.computed.bool('audioBuffer'),

  // webStreamUrl with proxying
  streamUrl: Ember.computed('webStreamUrl', 'scStreamUrl', function() {
    const webStreamUrl = this.get('webStreamUrl');
    const scStreamUrl = this.get('scStreamUrl');

    // TODO(TECHDEBT): this is a hack to not proxy soundcloud stream requests
    if (webStreamUrl && scStreamUrl) {
      return scStreamUrl;
    } else if (webStreamUrl) {
      return ENV.PROXY_URL + encodeURI(`/${webStreamUrl}`);
    }
  }),

  webStreamUrl: Ember.computed.or('s3StreamUrl', 'scStreamUrl', 'soundcloudTrack.streamUrl'),
  scStreamUrl: Ember.computed.reads('track.scStreamUrl'),
  s3StreamUrl: Ember.computed.reads('track.s3StreamUrl'),

  session: Ember.computed.reads('track.session'),
  audioContext: Ember.computed.reads('session.audioContext'),
  arrayBuffer: Ember.computed.or('fileArrayBuffer', 'streamUrlArrayBuffer'),

  audioBuffer: Ember.computed.reads('decodedArrayBuffer.content'),

  // TODO(COMPUTEDPROMISE): use that?
  streamUrlArrayBuffer: Ember.computed('streamUrl', function() {
    let streamUrl = this.get('streamUrl');

    Ember.Logger.log("fetch ajax", streamUrl);
    if (streamUrl) {
      let ajax = Ajax.create({
        url: this.get('streamUrl'),
        responseType: 'arraybuffer',
      });

      return DS.PromiseObject.create({
        promise: ajax.execute().catch((e) => {
          Ember.Logger.log('AudioSource XHR error: ' + e.target.statusText);
          throw e;
        }),
      });
    }
  }),

  // TODO(COMPUTEDPROMISE): use that?
  fileArrayBuffer: Ember.computed('file', function() {
    const file = this.get('file');

    if (file) {
      return DS.PromiseObject.create({
        promise: new Ember.RSVP.Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.addEventListener('progress', function (e) {
            // console.log('progress', e);
          });
          reader.addEventListener('load', function (e) {
            resolve(e.target.result);
          });
          reader.addEventListener('error', function (e) {
            Ember.Logger.log(`FileReader: Error reading file ${file.name}`, e, file);
            reject(e);
          });
          reader.readAsArrayBuffer(file);
        }),
      });
    }
  }),

  analyzeAudioTask: task(function * () {
    const audioBuffer = yield this.get('decodedArrayBuffer');
    if (audioBuffer) {
      const audioMeta = yield this.get('track.audioMeta');

      // TODO: analyze bpm, key here
      // console.log('audioMeta duration', audioBuffer.duration);
      audioMeta.setProperties({
        duration: audioBuffer.duration
      });
    }
  }).drop(),

  // TODO(COMPUTEDPROMISE): use that?
  decodedArrayBuffer: Ember.computed('audioContext', 'arrayBuffer', function() {
    console.log('decodedArrayBuffer');
    let { arrayBuffer, audioContext } = this.getProperties('arrayBuffer', 'audioContext');

    if (arrayBuffer) {
      let promise = arrayBuffer.then((arrayBuffer) => {
        return new Ember.RSVP.Promise((resolve, reject) => {
          audioContext.decodeAudioData(arrayBuffer, resolve, (error) => {
            Ember.Logger.log('AudioSource Decoding Error: ' + error.err);
            reject(error);
          });
        });
      });

      return DS.PromiseObject.create({ promise });
    }
  }),

  _peaksCache: Ember.computed(() => Ember.Map.create()),

  // returns a promise of an array of arrays of [ymin, ymax, frequency] values of the waveform
  // from startTime to endTime when broken into length subranges
  getPeaks({ startTime, endTime, length }) {
    // Ember.Logger.log('AudioBinary.getPeaks', startTime, endTime, length);

    const cacheKey = `startTime:${startTime},endTime:${endTime},length:${length}`;
    const peaksCache = this.get('_peaksCache');
    const cached = peaksCache.get(cacheKey);

    if (cached) {
      // Ember.Logger.log('AudioBinary.getPeaks cache hit', startTime, endTime, length);
      return cached;
    }

    const audioBuffer = this.get('audioBuffer');
    if (!audioBuffer || !isValidNumber(length)) { return asResolvedPromise([]); }

    startTime = isValidNumber(startTime) ? startTime : 0;
    endTime = isValidNumber(endTime) ? endTime : 0;

    // TODO(REFACTOR): update to use multiple channels
    const samples = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;
    const startSample = startTime * sampleRate;
    const endSample = endTime * sampleRate;

    const frameSize = 2048;
    const fft = new DSPJS.FFT(frameSize, audioBuffer.sampleRate);

    // const job = new Parallel({
    //   samples,
    //   startSample,
    //   endSample,
    //   length,
    // });

    // const cacheValue = job.spawn(({ samples, startSample, endSample, length }) => {
      const peaks = new Array(~~length);

      for (let i = startSample; i < endSample; i += frameSize) {
        const frame = getFrame(samples, i, frameSize);
        fft.forward(frame);

        const dominantFrequency = Math.max.apply(null, fft.spectrum);
        const min = Math.min.apply(null, frame);
        const max = Math.max.apply(null, frame);

        // add to peaks
        peaks[i] = [min, max, dominantFrequency];
      }

      const cacheValue = Ember.RSVP.Resolve(peaks);
    // });

    peaksCache.set(cacheKey, cacheValue);

    return cacheValue;
  },


  toString() {
    return '<linx@object:track/audio-binary>';
  },
});

function getFrame(samples, frameStart, frameSize) {
  const frame = new Float32Array(frameSize);
  frame.fill(0);

  for (let i = 0; i < Math.min(frameSize, samples.length - frameStart); i++) {
    frame[i] = samples[i + frameStart];
  }

  return frame;
}
