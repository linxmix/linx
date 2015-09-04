import Ember from 'ember';
import DS from 'ember-data';
import {
  beforeEach,
  describe,
  it
} from 'mocha';
import { expect } from 'chai';

import setupUnitTest from 'linx/tests/helpers/setup-unit-test';
import makeTrack from 'linx/tests/helpers/make-track';
import makeTransition from 'linx/tests/helpers/make-transition';
import makeMix from 'linx/tests/helpers/make-mix';
import describeAttrs from 'linx/tests/helpers/describe-attrs';

// TODO(TEST)
describe('MixModel', function() {
  setupUnitTest();

  let mix, arrangement;

  beforeEach(function() {
    let results = makeMix.call(this);
    mix = results.mix;
    arrangement = results.arrangement;

    // TODO(DBSTUB)
    // this.factoryHelper.handleCreate('mix');
  });

  describe('adding a track', function() {
    let track, trackClip, trackItem;

    beforeEach(function() {
      track = makeTrack.call(this);
      wait(mix.appendTrack(track).then((item) => {
        trackItem = item;
        trackClip = trackItem.get('clip.content');
      }));
    });

    describeAttrs('mix', {
      subject() { return mix; },
      length: 1,
      'trackItems.length': 1
    });

    it('returns the trackItem', function() {
      expect(trackItem).to.be.ok;
      expect(mix.objectAt(0)).to.equal(trackItem);
      expect(trackItem.get('isTrack')).to.be.true;
    });

    it('trackClip has correct track', function() {
      expect(trackClip.get('track.content')).to.equal(track);
    });

    it('can then remove trackItem', function() {
      wait(mix.removeObject(trackItem));

      andThen(function() {
        expect(mix.get('length')).to.equal(0);
        expect(mix.get('trackItems.length')).to.equal(0);
      });
    });
  });

  describe.skip('appendTransitionWithTracks', function() {
    let fromTrack, transition, toTrack;

    beforeEach(function() {
      let results = makeTransition.call(this);

      fromTrack = results.fromTrack;
      transition = results.transition;
      toTrack = results.toTrack;

      Ember.run(function() {
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

    it('adds fromTrack with transition', function() {
      expect(mix.trackAt(0)).to.equal(fromTrack);
    });

    it('adds toTrack with transition', function() {
      expect(mix.trackAt(1)).to.equal(toTrack);
    });

    it('adds valid transition', function() {
      expect(mix.objectAt(0).get('hasValidTransition')).to.be.true;
    });

    describe.skip('removing transition', function() {
      beforeEach(function() {
        Ember.run(function() {
          wait(mix.removeTransition(transition));
        });
      });

      describeAttrs('mix', {
        subject() { return mix; },
        length: 2,
        numTracks: 2,
        numTransitions: 0,
      });

      it('does not remove fromTrack', function() {
        expect(mix.trackAt(0)).to.equal(fromTrack);
      });

      it('does not remove toTrack', function() {
        expect(mix.trackAt(1)).to.equal(toTrack);
      });
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

  describe.skip('insertTransitionAt without track', function() {
    let transition, result;

    beforeEach(function() {
      let results = makeTransition.call(this);
      transition = results.transition;

      Ember.run(function() {
        wait(result = mix.insertTransitionAt(0, transition));
      });
    });

    it('returns undefined', function() {
      expect(result).to.equal(undefined);
    });

    describeAttrs('mix', {
      subject() { return mix; },
      length: 0,
      'numTracks': 0,
      'numTransitions': 0,
    });
  });

  describe.skip('insertTransitionAt with track', function() {
    let track, transition, result;

    beforeEach(function() {
      let track = makeTrack.call(this);

      let results = makeTransition.call(this);
      transition = results.transition;

      Ember.run(function() {
        wait(mix.insertTrackAt(0, track));
        wait(result = mix.insertTransitionAt(0, transition));
      });
    });

    it('returns promise', function() {
      expect(result.constructor).to.equal(DS.PromiseObject);
    });

    describeAttrs('mix', {
      subject() { return mix; },
      length: 1,
      'numTracks': 1,
      'numTransitions': 1,
    });
  });
});
