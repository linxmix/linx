import {
  beforeEach,
  describe,
  it
} from 'mocha';
import { expect } from 'chai';

import setupUnitTest from 'linx/tests/helpers/setup-unit-test';

// End to end testing of abstract list.
describe.only('AbstractList', function() {
  setupUnitTest();

  let list;

  beforeEach(function() {
    Ember.run(() => {
      list = this.store.createRecord('abstract-list');
    });
  });

  describe('with one item', function() {
    let item;

    beforeEach(function() {
      item = list.appendItem();
    });

    it('list is new', function() {
      expect(list.get('isNew')).to.be.true;
    });

    it('can add item', function() {
      expect(list.objectAt(0)).to.equal(item);
    });

    it('item is new', function() {
      expect(item.get('isNew')).to.be.true;
    });

    it('item has correct index', function() {
      expect(item.get('index')).to.equal(0);
    });

    it('item has reference to list', function() {
      expect(item.get('list.content')).to.equal(list);
    });

    it('has correct length', function() {
      expect(list.get('length')).to.equal(1);
    });

    it('can remove item', function() {
      list.removeItem(item);
      expect(list.get('length')).to.equal(0);
      expect(list.objectAt(0)).not.to.equal(item);
    });

    describe('after saving list to store', function() {
      beforeEach(function(done) {
        Ember.run(() => {
          list.save().then(() => {
            done();
          });
        });
      });

      it('list is no longer new', function() {
        expect(list.get('isNew')).to.be.false;
      });

      it('new item is saved', function() {
        expect(item.get('isNew')).to.be.false;
      });

      it('maintains relationship between list and item', function() {
        expect(list.objectAt(0)).to.equal(item);
        expect(list.get('length')).to.equal(1);
        expect(item.get('list.content')).to.equal(list);
      });

      it('can be fetched from store', function(done) {
        this.store.find('abstract-list', list.get('id')).then((storedList) => {
          expect(storedList).to.equal(list);
          done();
        });
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
  });

  describe('with multiple items', function() {
    let savedItem, newItem;

    beforeEach(function() {
      savedItem = list.appendItem();
      newItem = list.appendItem();

      wait(savedItem.save());
    });

    it('has correct length', function() {
      expect(list.get('length')).to.equal(2);
    });

    it('items have correct indices', function() {
      expect(savedItem.get('index')).to.equal(0);
      expect(newItem.get('index')).to.equal(1);
    });

    it('items have correct prevItem', function() {
      expect(savedItem.get('prevItem')).to.not.be.ok;
      expect(newItem.get('prevItem')).to.equal(savedItem);
    });

    it('items have correct nextItem', function() {
      expect(savedItem.get('nextItem')).to.equal(newItem);
      expect(newItem.get('nextItem')).to.not.be.ok;
    });

    it('can swap items', function() {
      list.swapItems(0, 1);
      expect(savedItem.get('index')).to.equal(1);
      expect(newItem.get('index')).to.equal(0);
    });

    describe('after list is saved to store', function() {
      it.skip('only saves new items', function() {

      });

      it.skip('preserves item ordering', function() {

      });

      it.skip('can swap items, and the new order persists', function() {

      });
    });

  });
});
