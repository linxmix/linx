/* global Parallel:true */
import Ember from 'ember';
import DS from 'ember-data';

import { task } from 'ember-concurrency';

import RequireAttributes from 'linx/lib/require-attributes';
import { isValidNumber, asResolvedPromise } from 'linx/lib/utils';
import ReadinessMixin from 'linx/mixins/readiness';
import Ajax from 'linx/lib/ajax';

export default Ember.Object.extend(
  ReadinessMixin('isArrayBufferLoadedAndDecoded'),
  RequireAttributes('track'), {

  file: Ember.computed.reads('track.file'),
  isLoading: Ember.computed.reads('arrayBuffer.isPending'),

  // implement readiness
  isArrayBufferLoadedAndDecoded: Ember.computed.bool('audioBuffer'),

  // webStreamUrl with proxying
  streamUrl: Ember.computed('webStreamUrl', function() {
    const webStreamUrl = this.get('webStreamUrl');

    if (webStreamUrl) {
      return encodeURI(`/${webStreamUrl}`);
    }
  }),

  webStreamUrl: Ember.computed.or('s3StreamUrl', 'scStreamUrl', 'soundcloudTrack.streamUrl'),
  scStreamUrl: Ember.computed.reads('track.scStreamUrl'),
  s3StreamUrl: Ember.computed.reads('track.s3StreamUrl'),

  session: Ember.computed.reads('track.session'),
  audioContext: Ember.computed.reads('session.audioContext'),
  arrayBuffer: Ember.computed.or('fileArrayBuffer', 'streamUrlArrayBuffer'),

  // TODO(REFACTOR): add test
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
            console.log('progress', e);
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
      console.log('audioMeta duration', audioBuffer.duration);
      audioMeta.setProperties({
        duration: audioBuffer.duration
      });
    }
  }).drop(),

  // TODO(COMPUTEDPROMISE): use that?
  decodedArrayBuffer: Ember.computed('audioContext', 'arrayBuffer', function() {
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

  // returns a promise of an array of arrays of [ymin, ymax] values of the waveform
  // from startTime to endTime when broken into length subranges
  // returns a promise
  getPeaks({ startTime, endTime, length }) {
    const audioBuffer = this.get('audioBuffer');
    if (!audioBuffer) { return asResolvedPromise([]); }

    Ember.assert('Cannot AudioBinary.getPeaks without length', isValidNumber(length));
    startTime = isValidNumber(startTime) ? startTime : 0;
    endTime = isValidNumber(endTime) ? endTime : 0;

    // TODO(REFACTOR): update to use multiple channels
    const samples = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;
    const startSample = startTime * sampleRate;
    const endSample = endTime * sampleRate;

    const job = new Parallel({
      samples,
      startSample,
      endSample,
      length,
    });

    return job.spawn(({ samples, startSample, endSample, length }) => {
      const sampleSize = (endSample - startSample) / length;
      const sampleStep = ~~(sampleSize / 10) || 1; // reduce granularity with small length
      const peaks = [];

      for (let i = 0; i < length; i++) {
        const start = ~~(startSample + i * sampleSize);
        const end = ~~(start + sampleSize);
        let min = samples[start] || 0;
        let max = samples[start] || 0;

        // calculate max and min in this sample
        for (let j = start; j < end; j += sampleStep) {
          const value = samples[j] || 0;

          if (value > max) {
            max = value;
          }
          if (value < min) {
            min = value;
          }
        }

        // add to peaks
        peaks[i] = [min, max];
      }

      return peaks;
    });
  },

  toString() {
    return '<linx@object:track/audio-binary>';
  },
});
