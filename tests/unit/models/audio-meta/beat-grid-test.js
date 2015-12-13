import Ember from 'ember';

import {
  beforeEach,
  describe,
  it
} from 'mocha';
import { expect } from 'chai';

import setupTestEnvironment from 'linx/tests/helpers/setup-test-environment';
import describeAttrs from 'linx/tests/helpers/describe-attrs';
import { timeToBeat } from 'linx/lib/utils';

const EPSILON = 0.005;

describe('BeatGrid', function() {
  setupTestEnvironment();

  let audioMeta, beatGrid;

  beforeEach(function() {
    audioMeta = this.factory.make('track/audio-meta');
    beatGrid = audioMeta.get('beatGrid');
  });

  describeAttrs('beatGrid', {
    subject() { return beatGrid; },
    beatCount() { return timeToBeat(audioMeta.get('duration'), audioMeta.get('bpm')); },
  });

  it('has correct firstBarOffset', function() {
    Ember.run(() => {
      // test with specific numbers
      beatGrid.get('gridMarker').set('time', 50.34);
      beatGrid.setProperties({
        bpm: 128.005,
        timeSignature: 4,
      });
    });

    expect(beatGrid.get('firstBarOffset')).to.be.closeTo(2.984703827177979, EPSILON);
  });

  it('has valid beatScale', function() {
    expect(beatGrid.get('beatScale')).to.be.ok;
  });

  it('has valid quantizeBeatScale', function() {
    expect(beatGrid.get('quantizeBeatScale')).to.be.ok;
  });

  it('has valid barScale', function() {
    expect(beatGrid.get('barScale')).to.be.ok;
  });

  it('has valid quantizeBarScale', function() {
    expect(beatGrid.get('quantizeBarScale')).to.be.ok;
  });

  describe('#timeToBeat', function() {
    it('lower bound is correct', function() {
      expect(beatGrid.timeToBeat(0)).to.equal(-1 * beatGrid.get('firstBarOffset'));
    });

    it('upper bound is correct', function() {
      expect(beatGrid.timeToBeat(audioMeta.get('duration'))).to.equal(audioMeta.get('beatCount') - beatGrid.get('firstBarOffset'));
    });
  });

  describe('#timeToBar', function() {
    it('lower bound is correct', function() {
      expect(beatGrid.timeToBar(0)).to.equal(beatGrid.timeToBeat(0) / audioMeta.get('timeSignature'));
    });

    it('upper bound is correct', function() {
      expect(beatGrid.timeToBar(audioMeta.get('duration')))
        .to.equal(beatGrid.timeToBeat(audioMeta.get('duration')) / audioMeta.get('timeSignature'));
    });
  });

  // TODO(MULTIGRID): rework
  describe('#nudge', function() {
    let nudgeAmount = 0.005, previousStart;

    beforeEach(function() {
      previousStart = beatGrid.get('gridMarker.time');
    });

    it('nudge right works', function() {
      Ember.run(() => {
        beatGrid.nudge(nudgeAmount);
      });

      expect(beatGrid.get('gridMarker.time')).to.equal(previousStart + nudgeAmount);
    });

    it('nudge left works', function() {
      Ember.run(() => {
        beatGrid.nudge(-nudgeAmount);
      });

      expect(beatGrid.get('gridMarker.time')).to.equal(previousStart - nudgeAmount);
    });
  });

  describe('#quantizeBeat', function() {
    let beat;

    beforeEach(function() {
      beat = audioMeta.get('halfBeatCount') + 1.2345;
    });

    it('operates correctly', function() {
      let quantizeBeat = beatGrid.quantizeBeat(beat);
      expect(quantizeBeat).to.be.closeTo(Math.round(beat), 1);
    });
  });

  describe('#quantizeBar', function() {
    let bar;

    beforeEach(function() {
      bar = audioMeta.get('halfBarCount') + 1.2345;
    });

    it('operates correctly', function() {
      let quantizeBar = beatGrid.quantizeBar(bar);
      expect(quantizeBar).to.be.closeTo(Math.round(bar), 1);
    });
  });
});
