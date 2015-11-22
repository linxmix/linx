import {
  beforeEach,
  describe,
  it
} from 'mocha';
import { expect } from 'chai';

import setupTestEnvironment from 'linx/tests/helpers/setup-test-environment';
import describeAttrs from 'linx/tests/helpers/describe-attrs';

describe('EchonestTrackModel', function() {
  setupTestEnvironment();

  let echonestTrack;

  beforeEach(function() {
    echonestTrack = this.factory.make('echonest/track-giveitupforlove');
  });

  describe('Analysis', function() {
    let analysis;

    beforeEach(function() {
      wait(echonestTrack.get('analysis').then((result) => {
        analysis = result;
      }));
    });

    it('can be fetched by echonest track', function() {
      expect(analysis).to.be.ok;
    });

    describeAttrs('analysis', {
      subject() { return analysis; },
      duration: 367.47320,
      bpm: 127.961,
      timeSignature: 4,
      key: 11,
      mode: 0,
      loudness: -4.804,
      'beats.length': 807,
      'confidentBeats.length': 214,
      'bars.length': 203,
      'confidentBars.length': 113,
      'sections.length': 13,
      'confidentSections.length': 10,
    });
  });
});
