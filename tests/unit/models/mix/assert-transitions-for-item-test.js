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

import { asResolvedPromise } from 'linx/lib/utils';

describe('MixModel#assertTransitionsForItem', function() {
  setupTestEnvironment();

  let mix, arrangement;
  let generateTransitionAtStub;

  beforeEach(function() {
    let results = makeMix.call(this);
    mix = this.mix = results.mix;
    arrangement = this.arrangement = results.arrangement;

    generateTransitionAtStub = this.sinon.stub(mix, 'generateTransitionAt', asResolvedPromise);

    Ember.run(() => {
      wait(mix.appendTrack(makeTrack.call(this)).then((trackItem) => {
        return mix.assertTransitionsForItem(trackItem);
      }));
    });
  });

  it('calls generateTransitionAt with prevIndex', function() {
    expect(generateTransitionAtStub.calledWithMatch(-1));
  });

  it('calls generateTransitionAt with nextIndex', function() {
    expect(generateTransitionAtStub.calledWithMatch(1));
  });
});
