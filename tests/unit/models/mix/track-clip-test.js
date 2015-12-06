import Ember from 'ember';

import {
  beforeEach,
  describe,
  it
} from 'mocha';
import { expect } from 'chai';
import Faker from 'npm:faker';

import setupTestEnvironment from 'linx/tests/helpers/setup-test-environment';
import MixTrackClip from 'linx/models/mix/track-clip';
import describeAttrs from 'linx/tests/helpers/describe-attrs';
import { DummyArrangement } from 'linx/tests/unit/mixins/playable-arrangement-test';

describe('MixTrackClip', function() {
  setupTestEnvironment();

  let metronome, arrangement, clip, track, audioStartBeat, audioEndBeat;

  beforeEach(function() {
    track = this.factory.make('track');
    arrangement = DummyArrangement.create({
      audioContext: this.audioContext,
    });
    metronome = arrangement.get('metronome');
    clip = MixTrackClip.create({
      arrangement,
      track,
    });
  });

  it('exists', function() {
    expect(clip).to.be.ok;
  });

  describe('without transitions', function() {
    describeAttrs('clip', {
      subject() { return clip; },
      startBeat: 0,
      audioStartBeat() { return clip.get('audioStartBeatWithoutTransition'); },
      audioEndBeat() { return clip.get('audioEndBeatWithoutTransition'); },
      audioStartBeatWithoutTransition() { return clip.get('audioMeta.firstWholeBeat'); },
      audioEndBeatWithoutTransition() { return clip.get('audioMeta.lastWholeBeat'); },
    });
  });

  describe.skip('with valid prevTransition', function() {
    beforeEach(function() {
      // TODO
    });

    describeAttrs('clip', {
      subject() { return clip; },
      startBeat() { return prevTransitionClip.get('startBeat'); },
      audioStartBeat() { return clip.get('audioStartBeatWithTransition'); },
      audioEndBeat() { return clip.get('audioEndBeatWithoutTransition'); },
      audioStartBeatWithTransition() { return prevTransition.get('toTrackStartBeat'); },
    });
  });

  describe.skip('with valid nextTransition', function() {
    beforeEach(function() {
      // TODO
    });

    describeAttrs('clip', {
      subject() { return clip; },
      startBeat: 0,
      audioStartBeat() { return clip.get('audioStartBeatWithoutTransition'); },
      audioEndBeat() { return clip.get('audioEndBeatWithTransition'); },
      audioEndBeatWithTransition() { return nextTransition.get('fromTrackEndBeat'); },
    });
  });

  describe.skip('with invalid transitions', function() {
    describeAttrs('clip', {
      subject() { return clip; },
      startBeat: 0,
      audioStartBeat() { return clip.get('audioStartBeatWithoutTransition'); },
      audioEndBeat() { return clip.get('audioEndBeatWithoutTransition'); },
    });
  });
});
