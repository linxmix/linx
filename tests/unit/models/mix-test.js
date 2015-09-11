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
