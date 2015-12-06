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

  let transitionClip, mixItem, transition;

  beforeEach(function() {
    mixItem = this.factory.make('mix/item');
    transition = mixItem.get('transition.content');
    transitionClip = MixTransitionClip.create({
      mixItem,
    });
  });

  it('exists', function() {
    expect(transitionClip).to.be.ok;
  });

  describe('with valid fromTrackClip and toTrackClip', function() {
    beforeEach(function() {
      Ember.run(() => {
        // TODO(CLEANUP): why?
        transition.get('arrangement.content').set('isReady', true);
      });
    });

    describeAttrs('transitionClip', {
      subject() { return transitionClip; },
      hasTransition: true,
      isValid: true,
      isReady: true,
      isReadyAndValid: true,
      'nestedArrangement.id'() { return transition.get('arrangement.id'); },
      fromTrackClip() { return mixItem.get('fromTrackClip'); },
      toTrackClip() { return mixItem.get('toTrackClip'); },
      startBeat() { return transitionClip.get('fromTrackClip.endBeat'); },
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
