import Ember from 'ember';
import DS from 'ember-data';
import {
  beforeEach,
  describe,
  it
} from 'mocha';
import { expect } from 'chai';

import setupTestEnvironment from 'linx/tests/helpers/setup-test-environment';
// import makeTrack from 'linx/tests/helpers/make-track';
// import makeTransition from 'linx/tests/helpers/make-transition';
import describeAttrs from 'linx/tests/helpers/describe-attrs';

// TODO(CLEANUP)
let makeMix = {};
let makeTrack = {};
let makeTransition = {};
describe.skip('MixModel#insertTransitionAtWithTracks', function() {
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

    it('adds valid transition to correct place', function() {
      expect(mix.transitionAt(0)).to.equal(transition);
      expect(mix.objectAt(0).get('hasValidTransition')).to.be.true;
    });

    it('adds toTrack to correct place', function() {
      expect(mix.modelAt(1)).to.equal(toTrack);
    });
  });

  describe('when matches fromTrack', function() {
    beforeEach(function() {
      Ember.run(() => {
        wait(mix.appendModel(fromTrack).then(() => {
          return mix.insertTransitionAtWithTracks(0, transition);
        }));
      });
    });

    describeAttrs('mix', {
      subject() { return mix; },
      length: 2,
    });

    it('adds valid transition to correct place', function() {
      expect(mix.transitionAt(0)).to.equal(transition);
      expect(mix.objectAt(0).get('hasValidTransition')).to.be.true;
    });

    it('adds toTrack to correct place', function() {
      expect(mix.modelAt(1)).to.equal(toTrack);
    });
  });

  describe('when does not match fromTrack', function() {
    let otherTrack, otherTrackItem;

    beforeEach(function() {
      otherTrack = makeTrack.call(this);

      Ember.run(() => {
        wait(mix.appendModel(otherTrack).then((_otherTrackItem) => {
          otherTrackItem = mix.objectAt(0);
          return mix.insertTransitionAtWithTracks(0, transition);
        }));
      });
    });

    describeAttrs('mix', {
      subject() { return mix; },
      length: 2,
    });

    it('adds valid transition to correct place', function() {
      expect(mix.transitionAt(0)).to.equal(transition);
      expect(mix.objectAt(0).get('hasValidTransition')).to.be.true;
    });

    it('adds fromTrack to correct place', function() {
      expect(mix.modelAt(0)).to.equal(fromTrack);
    });

    it('adds toTrack to correct place', function() {
      expect(mix.modelAt(1)).to.equal(toTrack);
    });

    // TODO: should this be the case?
    // it('retains existing otherTrackItem', function() {
    //   expect(mix.objectAt(0)).to.equal(otherTrackItem);
    // });
  });

  describe('when matches toTrack', function() {
    beforeEach(function() {
      Ember.run(() => {
        wait(mix.appendModel(toTrack).then(() => {
          return mix.insertTransitionAtWithTracks(0, transition);
        }));
      });
    });

    describeAttrs('mix', {
      subject() { return mix; },
      length: 2,
    });

    it('adds valid transition to correct place', function() {
      expect(mix.transitionAt(0)).to.equal(transition);
      expect(mix.objectAt(0).get('hasValidTransition')).to.be.true;
    });

    it('adds fromTrack to correct place', function() {
      expect(mix.modelAt(0)).to.equal(fromTrack);
    });
  });

  describe('when does not match toTrack', function() {
    let otherTrack, otherTrackItem;

    beforeEach(function() {
      otherTrack = makeTrack.call(this);

      Ember.run(() => {
        wait(mix.appendModel(otherTrack).then((_otherTrackItem) => {
          otherTrackItem = mix.objectAt(0);
          return mix.insertTransitionAtWithTracks(0, transition);
        }));
      });
    });

    describeAttrs('mix', {
      subject() { return mix; },
      length: 2,
    });

    it('adds valid transition to correct place', function() {
      expect(mix.transitionAt(0)).to.equal(transition);
      expect(mix.objectAt(0).get('hasValidTransition')).to.be.true;
    });

    it('adds fromTrack to correct place', function() {
      expect(mix.modelAt(0)).to.equal(fromTrack);
    });

    it('adds toTrack to correct place', function() {
      expect(mix.modelAt(1)).to.equal(toTrack);
    });

    // TODO: should this be the case?
    // it('retains existing otherTrackItem', function() {
    //   expect(mix.objectAt(0)).to.equal(otherTrackItem);
    // });
  });

  // TODO(TRANSITION): add tests
  //    when matches / doesnt match both tracks (?)
  //    when in middle of mix (?)
  //    insertModelAtWithTransitions too
});
