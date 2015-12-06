import Ember from 'ember';

import {
  beforeEach,
  describe,
  it
} from 'mocha';
import { expect } from 'chai';

import setupTestEnvironment from 'linx/tests/helpers/setup-test-environment';
import describeAttrs from 'linx/tests/helpers/describe-attrs';

const EPSILON = 0.005;

describe('AudioBinary', function() {
  setupTestEnvironment();

  let track, audioBinary;

  describe('track from s3', function() {
    beforeEach(function() {
      track = this.factory.make('giveitupforlove');
      audioBinary = track.get('audioBinary');
    });

    describeAttrs('audioBinary', {
      subject() { return audioBinary; },
      s3Url() { return track.get('s3Url'); },
      // TODO(S3)
      s3StreamUrl() { return `http://s3-us-west-2.amazonaws.com/linx-music/${track.get('s3Url')}`; },
      scStreamUrl: undefined,
      streamUrl() { return audioBinary.get('s3StreamUrl'); },
      proxyStreamUrl() { return `/${audioBinary.get('streamUrl')}`; },
    });

    // TODO(REFACTOR)
    it.skip('has correct streamUrlArrayBuffer', function() {

    });

    it.skip('has correct decodedArrayBuffer', function() {

    });
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

  // TODO(FILE)
  describe.skip('track from file', function() {
    describeAttrs('audioBinary', {
      subject() { return audioBinary; },
      streamUrl: undefined,
      file: 'not null',
    });
  });
});
