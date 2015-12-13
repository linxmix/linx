import Ember from 'ember';
import DS from 'ember-data';

import RequireAttributes from 'linx/lib/require-attributes';
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
