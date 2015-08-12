import Ember from 'ember';
import {
  beforeEach,
  describe,
  it
} from 'mocha';
import { expect } from 'chai';

import setupUnitTest from 'linx/tests/helpers/setup-unit-test';
import { assertPromise } from 'linx/lib/utils';

// End to end testing of abstract list.
describe('AbstractList', function() {
  setupUnitTest();

  let list;

  beforeEach(function() {
    Ember.run(() => {
      list = this.store.createRecord('abstract-list');
    });
  });

  describe('operations with one item', function() {
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
  });

  describe('with multiple items', function() {
    let itemA, itemB;

    beforeEach(function() {
      itemA = list.appendItem();
      itemB = list.appendItem();

      wait(itemA.save());
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
      list.swapItems(itemA, itemB);
      expect(itemA.get('index')).to.equal(1);
      expect(itemB.get('index')).to.equal(0);
    });

    it('can swap items by index', function() {
      list.swap(0, 1);
      expect(itemA.get('index')).to.equal(1);
      expect(itemB.get('index')).to.equal(0);
    });
  });


  describe('saving list', function() {

    describe('when empty', function() {
      beforeEach(function(done) {
        saveList(list, done);
      });

      it('list is no longer new', function() {
        expect(list.get('isNew')).to.be.false;
      });

      it('can be fetched from store', function(done) {
        this.store.find('abstract-list', list.get('id')).then((storedList) => {
          expect(storedList).to.equal(list);
          done();
        });
      });
    });

    describe('with one new item', function() {
      let item;

      beforeEach(function(done) {
        item = list.appendItem();
        saveList(list, done);
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
        item = list.appendItem();

        item.save().then(() => {
          this.sinon.stub(item, 'save', assertPromise);
          saveList(list, done);
        });
      });

      it('does not save item', function() {
        expect(item.save.called).to.be.false;
      });
    });

    describe('with two items', function() {
      let itemA, itemB;

      beforeEach(function(done) {
        itemA = list.appendItem();
        itemB = list.appendItem();

        saveList(list, done);
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
        itemA = list.appendItem();
        itemB = list.appendItem();
        list.swapItems(itemA, itemB);

        saveList(list, done);
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
