import {
  beforeEach,
  describe,
  it
} from 'mocha';
import { expect } from 'chai';

import setupTestEnvironment from 'linx/tests/helpers/setup-test-environment';

describe('EchonestTrack', function() {
  setupTestEnvironment();

  let echonestTrack;

  beforeEach(function() {
    echonestTrack = this.factory.make('echonest-track-giveitupforlove');
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

    it('has correct audio metadata', function() {
      expect(analysis.get('duration')).to.equal(367.47320);
      expect(analysis.get('bpm')).to.equal(127.961);
      expect(analysis.get('timeSignature')).to.equal(4);
      expect(analysis.get('key')).to.equal(11);
      expect(analysis.get('mode')).to.equal(0);
      expect(analysis.get('loudness')).to.equal(-4.804);
    });

    it('has correct fadeInTime and fadeOutTime', function() {
      expect(analysis.get('fadeInTime')).to.be.closeTo(0.11188, 0.005);
      expect(analysis.get('fadeOutTime')).to.be.closeTo(359.59583, 0.005);
    });

    it('has correct firstBeatStart and lastBeatStart', function() {
      expect(analysis.get('firstBeatStart')).to.be.closeTo(0.15951140261485935, 0.005);
      expect(analysis.get('lastBeatStart')).to.be.closeTo(367.30262532014035, 0.005);
    });

    it.skip('has correct firstBarStart and lastBarStart', function() {
      // expect(analysis.get('firstBarStart')).to.equal(0.11188);
      // expect(analysis.get('lastBarStart')).to.equal(0.11188);
    });
  });
});
