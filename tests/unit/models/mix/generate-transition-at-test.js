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
import makeTrackClip from 'linx/tests/helpers/make-track-clip';
import makeMix from 'linx/tests/helpers/make-mix';
import describeAttrs from 'linx/tests/helpers/describe-attrs';

describe('MixModel#generateTransitionAt', function() {
  setupTestEnvironment();

  let mix, arrangement;

  beforeEach(function() {
    let results = makeMix.call(this);
    mix = this.mix = results.mix;
    arrangement = this.arrangement = results.arrangement;
  });

  it('returns null with empty mix', function() {
    let result;

    wait(mix.generateTransitionAt(0).then((_result) => {
      result = _result;
    }));

    andThen(() => {
      expect(result).not.to.be.ok;
    });
  });

  describe('with one mixable', function() {
    let track;

    beforeEach(function() {
      track = makeTrack.call(this);

      Ember.run(() => {
        wait(mix.insertTrackAt(0, track));
      });
    });

    it('does nothing when prevItem missing', function() {
      wait(mix.generateTransitionAt(1));

      andThen(() => {
        expect(mix.get('length')).to.equal(1);
        expect(mix.modelAt(0)).to.equal(track);
      });
    });

    it('returns null with nextItem missing', function() {
      wait(mix.generateTransitionAt(0));

      andThen(() => {
        expect(mix.get('length')).to.equal(1);
        expect(mix.modelAt(0)).to.equal(track);
      });
    });
  });

  describe('in place of valid transition', function() {
    let transition, existingItem, resultItem;

    beforeEach(function() {
      let results = makeTransition.call(this);
      transition = results.transition;

      Ember.run(() => {
        wait(mix.insertTransitionAtWithTracks(0, transition).then((_existingItem) => {
          existingItem = _existingItem;
          return mix.generateTransitionAt(1).then((_resultItem) => {
            resultItem = _resultItem;
          });
        }));
      });
    });

    it('returns existing transitionItem', function() {
      expect(resultItem).to.equal(existingItem);
    });

    it('does not change mix length', function() {
      expect(mix.get('length')).to.equal(3);
    });
  });

  describe('between invalid transitions', function() {
    let invalidPrevItem, invalidNextItem;

    beforeEach(function() {
      let { transition } = makeTransition.call(this);

      Ember.run(() => {
        wait(mix.insertTransitionsAt(0, [transition, transition, transition]).then((results) => {
          invalidPrevItem = results[0];
          invalidNextItem = results[1];

          return mix.generateTransitionAt(2);
        }));
      });
    });

    it('removes invalid prevItem', function() {
      expect(mix.contains(invalidPrevItem)).to.be.false;
    });

    it('removes invalid nextItem', function() {
      expect(mix.contains(invalidNextItem)).to.be.false;
    });
  });

  describe('between two mixables', function() {
    let fromTrack, toTrack, transitionItem;

    beforeEach(function() {
      fromTrack = makeTrack.call(this);
      toTrack = makeTrack.call(this);

      Ember.run(() => {
        wait(mix.insertTracksAt(0, [fromTrack, toTrack]).then(() => {
          return mix.generateTransitionAt(1).then((_transitionItem) => {
            transitionItem = _transitionItem;
          });
        }));
      });
    });

    it('returns new transitionItem', function() {
      expect(transitionItem).to.be.ok;
    });

    it('transitionItem hasValidTransition', function() {
      expect(transitionItem.get('hasValidTransition')).to.be.true;
    });

    it('inserts transitionItem between the mixables', function() {
      expect(mix.objectAt(1)).to.equal(transitionItem);
    });

    it('fromTrack is in correct place', function() {
      expect(mix.modelAt(0)).to.equal(fromTrack);
    });

    it('toTrack is in correct place', function() {
      expect(mix.modelAt(2)).to.equal(toTrack);
    });

    it('mix has correct length', function() {
      expect(mix.get('length')).to.equal(3);
    });
  });

  describe('between two mixables within long mix', function() {
    let tracks, otherTracks, fromTrack, toTrack, transitionItem;

    beforeEach(function() {
      fromTrack = makeTrack.call(this);
      toTrack = makeTrack.call(this);

      otherTracks = [];
      for (let i = 0; i < 10; i++) {
        otherTracks.push(makeTrack.call(this));
      }

      tracks = otherTracks.concat([fromTrack, toTrack]);

      Ember.run(() => {
        console.log('tracks', tracks.length);
        wait(mix.appendTracks(tracks).then(() => {
          console.log('appended tracks', tracks.length);
          return mix.generateTransitionAt(mix.get('length') - 1).then((_transitionItem) => {
            console.log('generated transition', tracks.length);
            transitionItem = _transitionItem;
          });
        }));
      });
    });

    it('inserts transitionItem between the mixables', function() {
      let expectedIndex = mix.get('length') - 2;

      expect(mix.objectAt(expectedIndex)).to.equal(transitionItem);
    });

    it('fromTrack is in correct place', function() {
      let expectedIndex = mix.get('length') - 3;

      expect(mix.modelAt(expectedIndex)).to.equal(fromTrack);
    });

    it('toTrack is in correct place', function() {
      let expectedIndex = mix.get('length') - 1;

      expect(mix.modelAt(expectedIndex)).to.equal(toTrack);
    });
  });
});
