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

import OrderedHasManyMixin from 'linx/mixins/models/ordered-has-many';

// End to end testing of ordered-has-many and ordered-has-many-item.
describe('OrderedHasManyMixin', function() {
  setupTestEnvironment();

  let list;

  beforeEach(function() {
    Ember.run(() => {
      list = this.store.createRecord('ordered-has-many');
    });
  });

  describe('list.items#_getOrder', function() {
    it('returns correct order with no prevOrder or nextOrder', function() {
      expect(list.get('items')._getOrder()).to.equal(1);
    });

    it('returns correct order with prevOrder', function() {
      expect(list.get('items')._getOrder(1)).to.equal(2);
    });

    it('returns correct order with nextOrder', function() {
      expect(list.get('items')._getOrder(null, 2)).to.equal(1);
    });

    it('returns correct order with prevOrder and nextOrder', function() {
      expect(list.get('items')._getOrder(1, 2)).to.equal(1.5);
    });
  });

  describe('#getOrCreateAt', function() {
    let index = 0, item;

    describe('without item at index', function() {
      beforeEach(function() {
        item = list.getOrCreateAt(index);
      });

      it('creates new item', function() {
        expect(item).to.be.ok;
      });

      it('inserts item at index', function() {
        expect(list.objectAt(index)).to.equal(item);
      });
    });

    describe('with item at index', function() {
      let existingItem;

      beforeEach(function() {
        existingItem = list.createAt(index);
        item = list.getOrCreateAt(index);
      });

      it('returns existingItem', function() {
        expect(item).to.equal(existingItem);
      });

      it('does not create a new item', function() {
        expect(list.get('length')).to.equal(1);
      });
    });
  });

  describe('operations with one item', function() {
    let item;

    beforeEach(function() {
      Ember.run(() => {
        item = list.createAndAppend();
      });
    });

    it('list is new', function() {
      expect(list.get('isNew')).to.be.true;
    });

    it('list has correct length', function() {
      expect(list.get('length')).to.equal(1);
    });

    it('can add item', function() {
      expect(list.objectAt(0)).to.equal(item);
    });

    it('item is new', function() {
      expect(item.get('isNew')).to.be.true;
    });

    it('item has reference to list', function() {
      expect(item.get('list.content')).to.equal(list);
    });

    it('item has correct index', function() {
      expect(item.get('index')).to.equal(0);
    });

    describe('removing item', function() {
      beforeEach(function() {
        list.removeObject(item);
      });

      it('item was removed', function() {
        expect(list.get('length')).to.equal(0);
      });

      it('item.isRemoved is true', function() {
        expect(item.get('isRemoved')).to.be.true;
      });

      it('list.removedObjects contains item', function() {
        expect(list.get('removedObjects').contains(item)).to.be.true;
      });

      it('after adding item back, isRemoved is false', function() {
        Ember.run(() => {
          list.addObject(item);
        });

        expect(item.get('isRemoved')).to.be.false;
      });

      it('after adding item back, item is not in list.removedObjects', function() {
        Ember.run(() => {
          list.addObject(item);
        });

        expect(list.get('removedObjects').contains(item)).to.be.false;
      });

      it('saving list destroys item', function() {
        Ember.run(() => {
          wait(list.save());
        });

        andThen(() => {
          expect(item.get('isDeleted')).to.be.true;
          expect(item.get('isSaving')).to.be.false;
          expect(item.get('hasDirtyAttributes')).to.be.false;
        });
      });

      it('saving list removes item from hasMany', function() {
        Ember.run(() => {
          wait(list.save());
        });

        andThen(() => {
          expect(list.get('removedObjects.length')).to.equal(0);
          expect(list.get('items.length')).to.equal(0);
        });
      });
    });

  });

  describe('with two items', function() {
    let itemA, itemB;

    beforeEach(function() {
      Ember.run(() => {
        itemA = list.createAndAppend();
        itemB = list.createAndAppend();

        wait(itemA.save());
      });
    });

    it('has correct length', function() {
      expect(list.get('length')).to.equal(2);
    });

    it('items have correct indices', function() {
      expect(itemA.get('index')).to.equal(0);
      expect(itemB.get('index')).to.equal(1);
    });

    it('items have correct prevItem', function() {
      expect(itemA.get('prevItem')).to.not.be.ok;
      expect(itemB.get('prevItem')).to.equal(itemA);
    });

    it('items have correct nextItem', function() {
      expect(itemA.get('nextItem')).to.equal(itemB);
      expect(itemB.get('nextItem')).to.not.be.ok;
    });

    it('can swap items', function() {
      list.swap(itemA, itemB);
      expect(itemA.get('index')).to.equal(1);
      expect(itemB.get('index')).to.equal(0);
    });

    it('can swap items by index', function() {
      list.swapIndices(0, 1);
      expect(itemA.get('index')).to.equal(1);
      expect(itemB.get('index')).to.equal(0);
    });

    it('can remove second item', function() {
      Ember.run(() => {
        wait(list.removeAt(1));
      });

      andThen(() => {
        expect(list.get('length')).to.equal(1);
        expect(list.contains(itemA)).to.be.true;
        expect(list.contains(itemB)).to.be.false;
      });
    });
  });

  describe('swapping with three items', function() {
    let itemA, itemB, itemC;

    beforeEach(function() {
      Ember.run(() => {
        itemA = list.createAndAppend();
        itemB = list.createAndAppend();
        itemC = list.createAndAppend();
      });
    });

    it('swap first two items does not affect third', function() {
      list.swapIndices(0, 1);
      expect(itemA.get('index')).to.equal(1);
      expect(itemB.get('index')).to.equal(0);
      expect(itemC.get('index')).to.equal(2);
    });

    it('swap middle two items does not affect third', function() {
      list.swapIndices(1, 2);
      expect(itemA.get('index')).to.equal(0);
      expect(itemB.get('index')).to.equal(2);
      expect(itemC.get('index')).to.equal(1);
    });

    it('swap last two items does not affect third', function() {
      list.swapIndices(2, 0);
      expect(itemA.get('index')).to.equal(2);
      expect(itemB.get('index')).to.equal(1);
      expect(itemC.get('index')).to.equal(0);
    });
  });


  describe('saving list', function() {
    beforeEach(function() {
      Ember.run(() => {
        list.set('saveItems', true);
      });
    });

    describe('when empty', function() {
      beforeEach(function(done) {
        saveList(list, done);
      });

      it('list is no longer new', function() {
        expect(list.get('isNew')).to.be.false;
      });

      it('can be fetched from store', function(done) {
        this.store.find('ordered-has-many', list.get('id')).then((storedList) => {
          expect(storedList).to.equal(list);
          done();
        });
      });
    });

    describe('with one new item', function() {
      let item;

      beforeEach(function(done) {
        Ember.run(() => {
          item = list.createAndAppend();
          saveList(list, done);
        });
      });

      it('new item is saved', function() {
        expect(item.get('isNew')).to.be.false;
      });

      it('maintains relationship between list and item', function() {
        expect(list.objectAt(0)).to.equal(item);
        expect(list.get('length')).to.equal(1);
        expect(item.get('list.content')).to.equal(list);
      });

      it('removes item from list when item is deleted', function(done) {
        item.destroyRecord().then(() => {
          expect(list.objectAt(0)).not.to.equal(item);
          expect(list.get('length')).to.equal(0);
          done();
        });
      });

      it('removes item when list is deleted', function(done) {
        list.destroyRecord().then(() => {
          expect(item.get('isDeleted')).to.be.true;
          done();
        });
      });
    });

    describe('with one saved item', function() {
      let item;

      beforeEach(function(done) {
        Ember.run(() => {
          item = list.createAndAppend();

          item.save().then(() => {
            this.sinon.stub(item, 'save', asResolvedPromise);
            saveList(list, done);
          });
        });
      });

      it('does not save item', function() {
        expect(item.save.called).to.be.false;
      });
    });

    describe('with two items', function() {
      let itemA, itemB;

      beforeEach(function(done) {
        Ember.run(() => {
          itemA = list.createAndAppend();
          itemB = list.createAndAppend();

          saveList(list, done);
        });
      });

      it('saves both items', function() {
        expect(itemA.get('isNew')).to.be.false;
        expect(itemB.get('isNew')).to.be.false;
      });

      it('preserves item ordering', function() {
        expect(itemA.get('index')).to.equal(0);
        expect(itemB.get('index')).to.equal(1);
      });
    });

    describe('with two reordered items', function() {
      let itemA, itemB;

      beforeEach(function(done) {
        Ember.run(() => {
          itemA = list.createAndAppend();
          itemB = list.createAndAppend();
          list.swap(itemA, itemB);

          saveList(list, done);
        });
      });

      it('preserves item ordering', function() {
        expect(itemA.get('index')).to.equal(1);
        expect(itemB.get('index')).to.equal(0);
      });
    });
  });
});

function saveList(list, done) {
  Ember.run(() => {
    list.save().then(() => {
      done();
    });
  });
}
