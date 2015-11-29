import Ember from 'ember';
import {
  beforeEach,
  describe,
  it
} from 'mocha';
import { expect } from 'chai';

import setupTestEnvironment from 'linx/tests/helpers/setup-test-environment';
import describeAttrs from 'linx/tests/helpers/describe-attrs';
import MixTransitionClip from 'linx/models/mix/transition-clip';
import { DummyArrangement } from 'linx/tests/unit/mixins/playable-arrangement-test';

describe.skip('MixTransitionClip', function() {
  setupTestEnvironment();

  let metronome, arrangement, clip, mixItem, transition;

  beforeEach(function() {
    transition = this.factory.make('transition');
    arrangement = DummyArrangement.create({
      audioContext: this.audioContext,
    });
    metronome = arrangement.get('metronome');
    clip = MixTransitionClip.create({
      arrangement,
      mixItem,
    });
  });

  it('exists', function() {
    expect(clip).to.be.ok;
  });

  describeAttrs('empty transitionClip', {
    subject() { return this.factory.make('transition-clip'); },
    hasTransition: false,
    fromTrackIsValid: false,
    toTrackIsValid: false,
    // timesAreValid: false,
    isValid: false,
  });

  describe('with valid fromTrackClip and toTrackClip', function() {
    let fromTrackClip, transitionClip, toTrackClip, transition;

    beforeEach(function() {
      let results = makeTransitionClip.call(this);
      fromTrackClip = results.fromTrackClip;
      toTrackClip = results.toTrackClip;
      transitionClip = results.transitionClip;
      transition = results.transition;

      Ember.run(() => {
        transition.set('numBeats', 30);
        fromTrackClip.set('isFirstClip', true);
      });
    });

    describeAttrs('transitionClip', {
      subject() { return transitionClip; },
      hasTransition: true,
      fromTrackIsValid: true,
      toTrackIsValid: true,
      // timesAreValid: true,
      isValid: true,
      startBeat() { return toTrackClip.get('startBeat'); },
      numBeats() { return transition.get('numBeats'); }
    });
  });

  // TODO(TRANSITION)
  describe.skip('with conflicting prevTransition', function() {
  });
  describe.skip('with conflicting nextTransition', function() {
  });
  describe.skip('with invalid fromTrackClip', function() {
  });
  describe.skip('with valid fromTrackClip', function() {
  });
  describe.skip('with invalid toTrackClip', function() {
  });
  describe.skip('with valid toTrackClip', function() {
  });
});
