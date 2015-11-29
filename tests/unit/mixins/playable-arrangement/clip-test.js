import Ember from 'ember';

import {
  beforeEach,
  describe,
  it
} from 'mocha';
import { expect } from 'chai';

import setupTestEnvironment from 'linx/tests/helpers/setup-test-environment';
import describeAttrs from 'linx/tests/helpers/describe-attrs';
import PlayableClipMixin from 'linx/mixins/playable-arrangement/clip';
import { DummyArrangement } from '../playable-arrangement-test';

export const DummyClip = Ember.Object.extend(PlayableClipMixin);

describe('PlayableClipMixin', function() {
  setupTestEnvironment();

  let clip, arrangement, startBeat = 16.02, beatCount = 32.93;

  beforeEach(function() {
    arrangement = DummyArrangement.create({
      audioContext: this.audioContext,
    });
    clip = DummyClip.create({
      arrangement,
      startBeat,
      beatCount,
    });
  });

  describeAttrs('clip', {
    subject() { return clip; },
    startBeat: startBeat,
    beatCount: beatCount,
    endBeat() { return startBeat + beatCount; },
    outputNode() { return arrangement.get('inputNode'); },
    audioContext() { return arrangement.get('audioContext'); },
    metronome() { return arrangement.get('metronome'); },
    isValid: true,
    isValidStartBeat: true,
    isValidEndBeat: true,
    isValidBeatCount: true,
  });

  describe.skip('#getCurrentBeat', function() {
  });
});
