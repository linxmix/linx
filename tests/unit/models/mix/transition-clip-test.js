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

describe('MixTransitionClip', function() {
  setupTestEnvironment();

  let metronome, arrangement, transitionClip, mixItem, transition;

  beforeEach(function() {
    transition = this.factory.make('transition');
    mixItem = this.factory.make('mix/item', {
      transition,
    });
    arrangement = DummyArrangement.create({
      audioContext: this.audioContext,
    });
    metronome = arrangement.get('metronome');
    transitionClip = MixTransitionClip.create({
      arrangement,
      mixItem,
    });
  });

  it('exists', function() {
    expect(transitionClip).to.be.ok;
  });

  describeAttrs('basic transitionClip', {
    subject() { return transitionClip; },
    hasTransition: true,
    isValid: true,
    beatCount() { return transitionClip.get('transition.beatCount'); },
  });

  // TODO(REFACTOR): this doesnt maek sense.
  describe('with valid fromTrackClip and toTrackClip', function() {
    let fromTrack, toTrack;

    beforeEach(function() {
      fromTrack = this.factory.make('track');
      toTrack = this.factory.make('track');

      Ember.run(() => {
        transition.setProperties({
          fromTrack,
          toTrack,
        });
      });
    });

    describeAttrs('transitionClip', {
      subject() { return transitionClip; },
      isReady: true,
      isValid: true,
      isReadyAndValid: true,
      nestedArrangement() { return transition.get('arrangement'); },
      fromTrackClip() { return mixItem.get('fromTrackClip'); },
      toTrackClip() { return mixItem.get('toTrackClip'); },
      startBeat() { return transition.get('toTrackClip.startBeat'); },
      beatCount() { return transition.get('beatCount'); }
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
