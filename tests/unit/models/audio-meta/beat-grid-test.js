import Ember from 'ember';
import {
  beforeEach,
  describe,
  it
} from 'mocha';
import { expect } from 'chai';
import setupTestEnvironment from 'linx/tests/helpers/setup-test-environment';

import makeAudioMeta from 'linx/tests/helpers/make-audio-meta';

import {
  BAR_QUANTIZATION,
  BEAT_QUANTIZATION,
  TICK_QUANTIZATION,
  MS10_QUANTIZATION,
  MS1_QUANTIZATION,
  SAMPLE_QUANTIZATION,
} from 'linx/models/track/audio-meta/beat-grid';

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

  describe('#getQuantizedBeat', function() {
    let beat = 1234.56789, timeSignature;

    beforeEach(function() {
      timeSignature = audioMeta.get('timeSignature');
    });

    it('BAR_QUANTIZATION is correct', function() {
      let quantizedBeat = beatGrid.getQuantizedBeat(beat, BAR_QUANTIZATION);

      expect(quantizedBeat).to.equal(Math.round(beat / timeSignature) * timeSignature);
    });

    it('BEAT_QUANTIZATION is correct', function() {
      let quantizedBeat = beatGrid.getQuantizedBeat(beat, BEAT_QUANTIZATION);

      expect(quantizedBeat).to.equal(Math.round(beat));
    });

    it('SAMPLE_QUANTIZATION is correct', function() {
      let quantizedBeat = beatGrid.getQuantizedBeat(beat, SAMPLE_QUANTIZATION);

      expect(quantizedBeat).to.equal(beat);
    });
  });
});
