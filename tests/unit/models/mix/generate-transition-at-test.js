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
    expect(mix.generateTransitionAt(0)).not.to.be.ok;
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
        expect(mix.itemAt(0)).to.equal(track);
      });
    });

    it('returns null with nextItem missing', function() {
      wait(mix.generateTransitionAt(0));

      andThen(() => {
        expect(mix.get('length')).to.equal(1);
        expect(mix.itemAt(0)).to.equal(track);
      });
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
  });
});
