import Ember from 'ember';
import DS from 'ember-data';

import {
  beforeEach,
  describe,
  it
} from 'mocha';
import { expect } from 'chai';

import setupTestEnvironment from 'linx/tests/helpers/setup-test-environment';
import describeAttrs from 'linx/tests/helpers/describe-attrs';
import setupSinonServer from 'linx/tests/helpers/setup-sinon-server';

const EPSILON = 0.005;

describe('AudioBinary', function() {
  setupTestEnvironment();

  let track, audioBinary;

  function describeLoadingArrayBuffer(timeout = 2000) {
    describe('loading arrayBuffer', function() {
      let arrayBuffer, decodedArrayBuffer;

      beforeEach(function() {
        this.timeout(timeout);
        arrayBuffer = audioBinary.get('streamUrlArrayBuffer');
        decodedArrayBuffer = audioBinary.get('decodedArrayBuffer');
        wait(decodedArrayBuffer);
      });

      it('arrayBuffer is correct', function() {
        expect(arrayBuffer).is.an.instanceof(DS.PromiseObject);
        expect(arrayBuffer.get('isFulfilled')).to.be.true;
      });

      it('streamUrlArrayBuffer is correct', function() {
        expect(arrayBuffer).to.equal(audioBinary.get('streamUrlArrayBuffer'));
      });

      it('has correct decodedArrayBuffer', function() {
        expect(decodedArrayBuffer).is.an.instanceof(DS.PromiseObject);
        expect(decodedArrayBuffer.get('isFulfilled')).to.be.true;
        expect(decodedArrayBuffer.get('content')).to.be.an.instanceof(AudioBuffer);
      });
    });
  };

  describe('track from local file', function() {
    beforeEach(function() {
      track = this.factory.make('track', 'withLocalFile');
      audioBinary = track.get('audioBinary');
    });

    describeAttrs('audioBinary', {
      subject: () => audioBinary,
      fileUrl: () => '/assets/music/royals.mp3',
      s3StreamUrl: undefined,
      scStreamUrl: undefined,
      streamUrl: () => audioBinary.get('fileUrl'),
      proxyStreamUrl: () => `/${audioBinary.get('streamUrl')}`,
    });

    describeLoadingArrayBuffer();
  });

  describe('track from s3', function() {
    beforeEach(function() {
      track = this.factory.make('track', 'withSmallS3Url');
      audioBinary = track.get('audioBinary');
    });

    describeAttrs('audioBinary', {
      subject() { return audioBinary; },
      s3Url() { return track.get('s3Url'); },
      s3StreamUrl() { return `http://s3-us-west-2.amazonaws.com/linx-music/${track.get('s3Url')}`; },
      scStreamUrl: undefined,
      streamUrl() { return audioBinary.get('s3StreamUrl'); },
      proxyStreamUrl() { return `/${audioBinary.get('streamUrl')}`; },
    });

    // NOTE: this is end-to-end, meaning it will actually retrieve the audio binary from s3
    // so we set a longer timeout
    describeLoadingArrayBuffer(10000);
  });

  describe.skip('track from soundcloud', function() {
    describeAttrs('audioBinary', {
      subject() { return audioBinary; },
      s3StreamUrl: undefined,
      scStreamUrl: 'hi',
      streamUrl() { return audioBinary.get('scStreamUrl'); },
      proxyStreamUrl() { return `/${audioBinary.get('streamUrl')}`; },
    });
  });
});
