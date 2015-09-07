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

describe('MixModel', function() {
  setupTestEnvironment();

  let mix, arrangement;

  beforeEach(function() {
    let results = makeMix.call(this);
    mix = this.mix = results.mix;
    arrangement = this.arrangement = results.arrangement;

    // TODO(DBSTUB)
    // this.factoryHelper.handleCreate('mix');
  });

  describeItemOperations('track', function() {
    return makeTrack.call(this);
  });
  describeItemOperations('transition', function() {
    let results = makeTransition.call(this);
    return results.transition;
  });
  describeItemOperations('mix', function() {
    let results = makeMix.call(this);
    return results.mix;
  });

  describe('appendTransitionWithTracks', function() {
    let fromTrack, transition, toTrack, transitionItem;

    beforeEach(function() {
      let results = makeTransition.call(this);

      fromTrack = results.fromTrack;
      transition = results.transition;
      toTrack = results.toTrack;

      Ember.run(() => {
        wait(mix.appendTransitionWithTracks(transition).then((_item) => {
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
      expect(mix.objectAt(0).get('clipModel.content')).to.equal(fromTrack);
    });

    it('adds transition to correct place', function() {
      expect(mix.objectAt(1)).to.equal(transitionItem);
    });

    it('adds toTrack to correct place', function() {
      expect(mix.objectAt(2).get('clipModel.content')).to.equal(toTrack);
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

function describeItemOperations(modelName, createModelFn) {
  let capitalizedModelName = Ember.String.capitalize(modelName);

  describe(`adding ${modelName}Item`, function() {
    let model, item, clip;

    beforeEach(function() {
      model = createModelFn.call(this);

      Ember.run(() => {
        wait(this.mix[`append${capitalizedModelName}`](model).then((_item) => {
          item = _item;
          clip = _item.get('clip.content');
        }));
      });
    });

    it('added to mix', function() {
      expect(this.mix.get('length')).to.equal(1);
      expect(this.mix.get(`${modelName}Items.length`)).to.equal(1);
    });

    it('returns the item', function() {
      expect(Ember.isNone(item)).to.be.false;
      expect(this.mix.objectAt(0)).to.equal(item);
      expect(item.get(`is${capitalizedModelName}`)).to.be.true;
    });

    it('clip has correct model', function() {
      expect(clip.get(`${modelName}.content`)).to.equal(model);
    });

    it('can then remove item', function() {
      Ember.run(() => {
        wait(this.mix.removeObject(item));
      });

      andThen(() => {
        expect(this.mix.get('length')).to.equal(0);
        expect(this.mix.get(`${modelName}Items.length`)).to.equal(0);
      });
    });
  });
}
