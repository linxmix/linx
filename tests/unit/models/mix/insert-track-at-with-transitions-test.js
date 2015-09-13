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

describe.skip('MixModel#insertTrackAtWithTransitions', function() {
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
    let transitionItem;

    beforeEach(function() {
      Ember.run(() => {
        wait(mix.insertTrackAtWithTransitions(0, transition).then((_item) => {
          transitionItem = _item;
        }));
      });
    });

    describeAttrs('mix', {
      subject() { return mix; },
      length: 3,
      'trackItems.length': 2,
      'transitionItems.length': 1,
    });

    it('adds fromTrack to correct place', function() {
      expect(mix.objectAt(0).get('model.content')).to.equal(fromTrack);
    });

    it('adds transition to correct place', function() {
      expect(mix.objectAt(1)).to.equal(transitionItem);
    });

    it('adds toTrack to correct place', function() {
      expect(mix.objectAt(2).get('model.content')).to.equal(toTrack);
    });
  });

  describe.skip('appendTransitionWithTracks when matches fromTrack', function() {
    let fromTrack, transition, toTrack;

    beforeEach(function() {
      fromTrack = makeTrack.call(this);

      let results = makeTransition.call(this, {
        fromTrack: fromTrack
      });

      transition = results.transition;
      toTrack = results.toTrack;

      Ember.run(function() {
        wait(mix.appendTrack(fromTrack));
        wait(mix.appendTransitionWithTracks(transition));
      });
    });

    describeAttrs('mix', {
      subject() { return mix; },
      length: 2,
      'numTracks': 2,
      'numTransitions': 1,
    });

    it('puts transition in correct place', function() {
      expect(mix.transitionAt(0)).to.equal(transition);
    });

    it('retains current fromTrack', function() {
      expect(mix.trackAt(0)).to.equal(fromTrack);
    });

    it('adds toTrack', function() {
      expect(mix.trackAt(1)).to.equal(toTrack);
    });

    it('added valid transition', function() {
      expect(mix.objectAt(0).get('hasValidTransition')).to.be.true;
    });
  });

  describe.skip('appendTransitionWithTracks when does not match fromTrack', function() {
    let track, fromTrack, transition, toTrack;

    beforeEach(function() {
      track = makeTrack.call(this);

      let results = makeTransition.call(this);
      fromTrack = results.fromTrack;
      transition = results.transition;
      toTrack = results.toTrack;

      Ember.run(function() {
        wait(mix.appendTrack(track));
        wait(mix.appendTransitionWithTracks(transition));
      });
    });

    describeAttrs('mix', {
      subject() { return mix; },
      length: 3,
      'numTracks': 3,
      'numTransitions': 1,
    });

    it('puts transition in correct place', function() {
      expect(mix.transitionAt(1)).to.equal(transition);
    });

    it('retains track', function() {
      expect(mix.trackAt(0)).to.equal(track);
      expect(track).not.to.equal(fromTrack);
    });

    it('adds fromTrack', function() {
      expect(mix.trackAt(1)).to.equal(fromTrack);
    });

    it('adds toTrack', function() {
      expect(mix.trackAt(2)).to.equal(toTrack);
    });

    it('added valid transition', function() {
      expect(mix.objectAt(1).get('hasValidTransition')).to.be.true;
    });
  });

});
