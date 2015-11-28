import Ember from 'ember';
import DS from 'ember-data';

import RequireAttributes from 'linx/lib/require-attributes';
import ReadinessMixin from 'linx/mixins/readiness';
import Ajax from 'linx/lib/ajax';

export default Ember.Object.extend(
  ReadinessMixin('isArrayBufferLoaded'),
  RequireAttributes('track'), {

  // implement readiness
  isArrayBufferLoaded: Ember.computed.reads('arrayBuffer.isFulfilled'),

  streamUrl: Ember.computed.or('s3StreamUrl', 'scStreamUrl', 'soundcloudTrack.streamUrl'),
  proxyStreamUrl: Ember.computed('streamUrl', function() {
    return `/${this.get('_streamUrl')}`;
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

  // TODO(FILE)
  file: null,
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

      return ajax.execute().catch((e) => {
        console.log('AudioSource XHR error: ' + e.target.statusText);
        throw e;
      });
    }
  }),

  // TODO(COMPUTEDPROMISE): use that?
  // TODO(WEBWORKER): handle in web worker
  decodedArrayBuffer: Ember.computed('audioContext', 'arrayBuffer', function() {
    let { arrayBuffer, audioContext } = this.getProperties('arrayBuffer', 'audioContext');

    return DS.PromiseArray.create({
      promise: arrayBuffer.then((arrayBuffer) => {
        return audioContext.decodeAudioData(arrayBuffer).catch((error) => {
          console.log('AudioSource Decoding Error: ' + error.err);
          throw error;
        });
      }),
    });
  }),
});

// TODO: load from file/blob
// TODO: handle in web worker
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
