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
    mix = results.mix;
    arrangement = this.arrangement = results.arrangement;

    // TODO(DBSTUB)
    // this.factoryHelper.handleCreate('mix');
  });

  describe('model item operations', function() {
    describe('adding model', function() {
      let model, item, clip;

      beforeEach(function() {
        model = makeTrack.call(this);

        Ember.run(() => {
          wait(mix.appendModel(model).then((_item) => {
            item = _item;
            clip = _item.get('clip.content');
          }));
        });
      });

      it('added to mix', function() {
        expect(mix.get('length')).to.equal(1);
      });

      it('returns the item', function() {
        expect(Ember.isNone(item)).to.be.false;
        expect(mix.objectAt(0)).to.equal(item);
      });

      it('clip has correct model', function() {
        expect(clip.get('model.content')).to.equal(model);
      });

      it('can then remove item', function() {
        Ember.run(() => {
          wait(mix.removeObject(item));
        });

        andThen(() => {
          expect(mix.get('length')).to.equal(0);
        });
      });
    });

    describe('adding many models', function() {
      let models;

      beforeEach(function() {
        models = [];
        for (let i = 0; i < 10; i++) {
          models.push(makeTrack.call(this));
        }

        Ember.run(() => {
          wait(mix.appendModels(models));
        });
      });

      it('adds items to mix', function() {
        expect(mix.get('length')).to.equal(models.length);
      });

      it('adds models in order', function() {
        models.forEach((model, i) => {
          expect(mix.modelAt(i)).to.equal(model);
        });
      });
    });
  });
});
