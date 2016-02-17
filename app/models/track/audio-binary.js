import Ember from 'ember';
import DS from 'ember-data';

import RequireAttributes from 'linx/lib/require-attributes';
import { isNumber } from 'linx/lib/utils';
import ReadinessMixin from 'linx/mixins/readiness';
import Ajax from 'linx/lib/ajax';

export default Ember.Object.extend(
  ReadinessMixin('isArrayBufferLoadedAndDecoded'),
  RequireAttributes('track'), {

  // implement readiness
  isArrayBufferLoadedAndDecoded: Ember.computed.and('arrayBuffer.isFulfilled', 'decodedArrayBuffer.content'),

  streamUrl: Ember.computed.or('fileUrl', 's3StreamUrl', 'scStreamUrl', 'soundcloudTrack.streamUrl'),
  proxyStreamUrl: Ember.computed('streamUrl', function() {
    return `/${this.get('streamUrl')}`;
  }),

  s3Url: Ember.computed.reads('track.s3Url'),
  s3StreamUrl: Ember.computed('s3Url', function() {
    if (!Ember.isNone(this.get('s3Url'))) {
      // TODO(S3)
      return "http://s3-us-west-2.amazonaws.com/linx-music/" + this.get('s3Url');
    }
  }),

  session: Ember.computed.reads('track.session'),
  audioContext: Ember.computed.reads('session.audioContext'),
  arrayBuffer: Ember.computed.reads('streamUrlArrayBuffer'),

  // TODO(REFACTOR): add test
  audioBuffer: Ember.computed.reads('decodedArrayBuffer.content'),

  // TODO(COMPUTEDPROMISE): use that?
  streamUrlArrayBuffer: Ember.computed('streamUrl', function() {
    let streamUrl = this.get('streamUrl');

    console.log("fetch ajax", streamUrl);
    if (streamUrl) {
      let ajax = Ajax.create({
        url: this.get('streamUrl'),
        responseType: 'arraybuffer',
      });

      return DS.PromiseObject.create({
        promise: ajax.execute().catch((e) => {
          console.log('AudioSource XHR error: ' + e.target.statusText);
          throw e;
        }),
      });
    }
  }),

  // TODO(COMPUTEDPROMISE): use that?
  // TODO(WEBWORKER): handle in web worker
  decodedArrayBuffer: Ember.computed('audioContext', 'arrayBuffer', function() {
    let { arrayBuffer, audioContext } = this.getProperties('arrayBuffer', 'audioContext');

    if (arrayBuffer) {
      let promise = arrayBuffer.then((arrayBuffer) => {
        return new Ember.RSVP.Promise((resolve, reject) => {
          audioContext.decodeAudioData(arrayBuffer, resolve, (error) => {
            console.log('AudioSource Decoding Error: ' + error.err);
            reject(error);
          });
        });
      });

      return DS.PromiseObject.create({ promise });
    }
  }),

  // returns an array of arrays of [ymin, ymax] values of the waveform
  // from startTime to endTime when broken into length subranges
  // TODO(WEBWORKER): handle in web worker
  getPeaks({ startTime, endTime, length }) {
    let audioBuffer = this.get('audioBuffer');
    if (!audioBuffer) { return []; }

    Ember.assert('Cannot AudioBinary.getPeaks without endTime', isNumber(endTime));
    startTime = startTime || 0;

    let sampleRate = audioBuffer.sampleRate;
    let startSample = startTime * sampleRate;
    let endSample = endTime * sampleRate;

    let sampleSize = (endSample - startSample) / length;
    let sampleStep = ~~(sampleSize / 10) || 1; // reduce granularity with small length
    let peaks = [];

    // console.log('getPeaks', length, startTime, endTime, sampleSize, sampleRate, startSample, endSample, audioBuffer.length);

    // TODO(REFACTOR): update to use multiple channels
    let samples = audioBuffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      let start = ~~(startSample + i * sampleSize);
      let end = ~~(start + sampleSize);
      let min = samples[start];
      let max = samples[start];

      // calculate max and min in this sample
      for (let j = start; j < end; j += sampleStep) {
        let value = samples[j];

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
  },

  // TODO: load from file/blob
  // TODO: handle in web worker
  // TODO(FILE)
  file: null,
  fileUrl: Ember.computed.reads('track.fileUrl'),

  toString() {
    return '<linx@object:track/audio-binary>';
  },
});

/**
     * Loads audio data from a Blob or File object.
     *
     * @param {Blob|File} blob Audio data.
     */
    // loadBlob: function (blob) {
    //     var my = this;
    //     // Create file reader
    //     var reader = new FileReader();
    //     reader.addEventListener('progress', function (e) {
    //         my.onProgress(e);
    //     });
    //     reader.addEventListener('load', function (e) {
    //         my.loadArrayBuffer(e.target.result);
    //     });
    //     reader.addEventListener('error', function () {
    //         my.fireEvent('error', 'Error reading file');
    //     });
    //     reader.readAsArrayBuffer(blob);
    //     this.empty();
    // },
