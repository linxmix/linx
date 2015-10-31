import {
  beforeEach,
  describe,
  it
} from 'mocha';
import { expect } from 'chai';
import setupTestEnvironment from 'linx/tests/helpers/setup-test-environment';

import makeAudioMeta from 'linx/tests/helpers/make-audio-meta';

describe('BeatGrid', function() {
  setupTestEnvironment();

  let audioMeta, beatGrid;

  beforeEach(function() {
    audioMeta = makeAudioMeta.call(this);
    beatGrid = audioMeta.get('beatGrid');
  });

  it('has correct firstBarOffset', function() {
    expect(beatGrid.get('firstBarOffset')).to.be.closeTo(0.2991750347962758, 0.005);
  });

  it('has valid beatScale', function() {
    expect(beatGrid.get('beatScale')).to.be.ok;
  });

  it('has valid barScale', function() {
    expect(beatGrid.get('barScale')).to.be.ok;
  });

  describe('#timeToBeat', function() {
    it('lower bound is correct', function() {
      expect(beatGrid.timeToBeat(0)).to.equal(-1 * beatGrid.get('firstBarOffset'));
    });

    it('upper bound is correct', function() {
      expect(beatGrid.timeToBeat(audioMeta.get('duration'))).to.equal(audioMeta.get('numBeats') - beatGrid.get('firstBarOffset'));
    });
  });

  describe('#timeToBar', function() {
    it('lower bound is correct', function() {
      expect(beatGrid.timeToBar(0)).to.equal(beatGrid.timeToBeat(0) / 4.0);
    });

    it('upper bound is correct', function() {
      expect(beatGrid.timeToBar(audioMeta.get('duration')))
        .to.equal(beatGrid.timeToBeat(audioMeta.get('duration')) / 4.0);
    });
  });

  // TODO(MULTIGRID): rework
  describe('#nudge', function() {
    let nudgeAmount = 0.005, previousStart;

    beforeEach(function() {
      previousStart = beatGrid.get('gridMarker.start');
    });

    it('nudge right works', function() {
      Ember.run(() => {
        beatGrid.nudge(nudgeAmount);
      });

      expect(beatGrid.get('gridMarker.start')).to.equal(previousStart + nudgeAmount);
    });

    it('nudge left works', function() {
      Ember.run(() => {
        beatGrid.nudge(-nudgeAmount);
      });

      expect(beatGrid.get('gridMarker.start')).to.equal(previousStart - nudgeAmount);
    });
  });
});
