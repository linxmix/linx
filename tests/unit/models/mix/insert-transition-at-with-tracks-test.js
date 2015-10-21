import Ember from 'ember';
import DS from 'ember-data';
import {
  beforeEach,
  describe,
  it
} from 'mocha';
import { expect } from 'chai';

import setupTestEnvironment from 'linx/tests/helpers/setup-test-environment';
import makeTrack from 'linx/tests/helpers/make-track';
import makeTransition from 'linx/tests/helpers/make-transition';
import makeMix from 'linx/tests/helpers/make-mix';
import describeAttrs from 'linx/tests/helpers/describe-attrs';

describe('MixModel#insertTransitionAtWithTracks', function() {
  setupTestEnvironment();

  let mix, arrangement;
  let fromTrack, transition, toTrack;

  beforeEach(function() {
    let results = makeMix.call(this);
    mix = this.mix = results.mix;
    arrangement = this.arrangement = results.arrangement;

    let transitionResults = makeTransition.call(this);

    fromTrack = transitionResults.fromTrack;
    transition = transitionResults.transition;
    toTrack = transitionResults.toTrack;
  });

  describe('into empty mix', function() {
    beforeEach(function() {
      Ember.run(() => {
        wait(mix.insertTransitionAtWithTracks(0, transition).then());
      });
    });

    describeAttrs('mix', {
      subject() { return mix; },
      length: 2,
    });

    it('adds fromTrack to correct place', function() {
      expect(mix.modelAt(0)).to.equal(fromTrack);
    });

    it('adds transition to correct place', function() {
      expect(mix.transitionAt(0)).to.equal(transition);
    });

    it('adds toTrack to correct place', function() {
      expect(mix.modelAt(1)).to.equal(toTrack);
    });
  });

  describe('when matches fromTrack', function() {
    let trackItem;

    beforeEach(function() {
      Ember.run(() => {
        wait(mix.appendModel(fromTrack).then((_trackItem) => {
          trackItem = _trackItem;
          return mix.insertTransitionAtWithTracks(0, transition);
        }));
      });
    });

    describeAttrs('mix', {
      subject() { return mix; },
      length: 2,
    });

    it('retains existing trackItem', function() {
      expect(mix.objectAt(0)).to.equal(trackItem);
    });

    it('adds transition to correct place', function() {
      expect(mix.transitionAt(0)).to.equal(transition);
    });
  });

  describe('when does not match fromTrack', function() {
    let otherTrack, otherTrackItem;

    beforeEach(function() {
      otherTrack = makeTrack.call(this);

      Ember.run(() => {
        wait(mix.appendModel(otherTrack).then((_otherTrackItem) => {
          otherTrackItem = _otherTrackItem;
          return mix.insertTransitionAtWithTracks(1, transition);
        }));
      });
    });

    describeAttrs('mix', {
      subject() { return mix; },
      length: 3,
    });

    it('retains existing otherTrackItem', function() {
      expect(mix.objectAt(0)).to.equal(otherTrackItem);
    });

    it('adds fromTrack to correct place', function() {
      expect(mix.modelAt(1)).to.equal(fromTrack);
    });

    it('adds transition to correct place', function() {
      expect(mix.transitionAt(1)).to.equal(transition);
    });

    it('adds toTrack to correct place', function() {
      expect(mix.modelAt(2)).to.equal(toTrack);
    });
  });
});
