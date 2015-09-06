import Ember from 'ember';
import DS from 'ember-data';
import {
  beforeEach,
  describe,
  it
} from 'mocha';
import { expect } from 'chai';

import setupTestEnvironment from 'linx/tests/helpers/setup-test-environment';
import { asResolvedPromise } from 'linx/lib/utils';

import DependentRelationshipMixin from 'linx/mixins/models/dependent-relationship';

describe('DependentRelationshipMixin', function() {
  setupTestEnvironment();

  let list;

  beforeEach(function() {
    list = this.factory.make('ordered-has-many');
  });

  it('#hasDirtyDependentModels is false with empty dependents', function() {
    expect(list.get('hasDirtyDependentModels')).to.be.false;
  });

  describe('with dependents', function() {
    let dirtyItem, cleanItem;

    beforeEach(function() {
      Ember.run(() => {
        dirtyItem = list.createAndAppend();
        cleanItem = list.createAndAppend();
      });

      wait(saveRecord(cleanItem));
    });

    describe('#hasDirtyDependentModels', function() {
      it('is true when a dependent is dirty', function() {
        expect(list.get('hasDirtyDependentModels')).to.be.true;
      });

      it('is false when no dependents are dirty', function() {
        wait(saveRecord(dirtyItem));

        andThen(() => {
          expect(list.get('hasDirtyDependentModels')).to.be.false;
        });
      });
    });

    describe('#anyDirty', function() {
      it('is true when hasDirtyDependentModels but not hasDirtyAttributes', function() {
        expect(list.get('anyDirty')).to.be.true;
      });

      it('is true when not hasDirtyDependentModels but hasDirtyAttributes', function() {
        Ember.run(() => { list.set('title', 'test-title'); });
        wait(saveRecord(dirtyItem));

        andThen(() => {
          expect(list.get('anyDirty')).to.be.true;
        });
      });

      it('is false when not hasDirtyDependentModels and not hasDirtyAttributes', function() {
        wait(saveRecord(dirtyItem));

        andThen(() => {
          expect(list.get('anyDirty')).to.be.false;
        });
      });
    });

    describe('saving master model', function() {
      let cleanItemSaveSpy, itemSaveSpy, listSaveSpy;

      beforeEach(function() {
        cleanItemSaveSpy = this.sinon.spy(cleanItem, 'save');
        itemSaveSpy = this.sinon.spy(dirtyItem, 'save');
        listSaveSpy = this.sinon.spy(list, 'save');

        wait(saveRecord(list));
      });

      it('saves dirty dependents', function() {
        expect(list.get('hasDirtyDependentModels')).to.be.false;
        expect(itemSaveSpy.calledOnce).to.be.true;
      });

      it('does not save clean dependents', function() {
        expect(cleanItemSaveSpy.called).to.be.false;
      });

      it('saves master model', function() {
        expect(listSaveSpy.called).to.be.true;
      });

      it('after save, master model anyDirty is false', function() {
        expect(list.get('anyDirty')).to.be.false;
      });
    });

    describe('destroying master model', function() {
      let dirtyItemDestroySpy, cleanItemDestroySpy, listDestroySpy;

      beforeEach(function() {
        dirtyItemDestroySpy = this.sinon.spy(dirtyItem, 'destroyRecord');
        cleanItemDestroySpy = this.sinon.spy(cleanItem, 'destroyRecord');
        listDestroySpy = this.sinon.spy(list, 'destroyRecord');

        wait(destroyRecord(list));
      });

      it('destroys all dependents', function() {
        expect(dirtyItemDestroySpy.calledOnce).to.be.true;
        expect(cleanItemDestroySpy.calledOnce).to.be.true;
      });

      it('destroys master model', function() {
        expect(listDestroySpy.calledOnce).to.be.true;
      });

      it('after destroy, master model is deleted', function() {
        expect(list.get('isDeleted')).to.be.true;
      });
    });
  });
});

function saveRecord(model) {
  let promise;

  Ember.run(() => {
    promise = model.save();
  });

  return promise;
}

function destroyRecord(model) {
  let promise;

  Ember.run(() => {
    promise = model.destroyRecord();
  });

  return promise;
}
