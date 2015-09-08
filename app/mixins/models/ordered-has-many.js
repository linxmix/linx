import Ember from 'ember';
import DS from 'ember-data';
import _ from 'npm:underscore';

import DependentRelationshipMixin from './dependent-relationship';
import ReadinessMixin from '../readiness';

import withDefault from 'linx/lib/computed/with-default';

export default function(options = {}) {
  let { itemModelName, itemsPath } = options;
  Ember.assert('Need itemModelName and itemsPath for OrderedHasManyMixin', itemModelName && itemsPath);

  let mixinParams = {

    // config
    saveItems: true,

    length: Ember.computed.alias(`${itemsPath}.length`),

    // creates a new item and appends it to end of list
    createAndAppend: function(params) {
      return this.createItemAt(this.get('length'), params);
    },

    appendItem: function(item) {
      this.insertItemAt(this.get('length'), item);
    },

    removeItem: function(item) {
      return this.get(itemsPath).removeObject(item);
    },

    removeAt: function(index) {
      return this.get(itemsPath).removeAt(index);
    },

    removeObject(object) {
      return this.get(itemsPath).removeObject(object);
    },

    insertItemAt: function(index, item) {
      return this.get(itemsPath).insertAt(index, item);
    },

    indexOf: function(item) {
      return this.get(itemsPath).indexOf(item);
    },

    objectAt: function(index) {
      return this.get(itemsPath).objectAt(index);
    },

    // swaps position of items
    swapItems: function(itemA, itemB) {
      return this.swap(this.indexOf(itemA), this.indexOf(itemB));
    },

    // swaps position of items at two given indices
    swap: function(indexA, indexB) {
      let items = this.get(itemsPath);
      let itemA = this.objectAt(indexA);
      let itemB = this.objectAt(indexB);

      Ember.assert('Items must be present to swap.', Ember.isPresent(itemA) && Ember.isPresent(itemB));
      Ember.assert('Must provide different indexes to swap.', indexA !== indexB);

      items.removeObjects([itemA, itemB]);

      // items.replace(indexA, 1, [itemB]);
      // items.replace(indexB, 1, [itemA]);

      if (indexA < indexB) {
        items.insertAt(indexA, itemB);
        items.insertAt(indexB, itemA);
      } else {
        items.insertAt(indexB, itemA);
        items.insertAt(indexA, itemB);
      }

      return items;
    },

    // creates a new item and inserts it at given index
    createItemAt: function(index, params) {
      let item = this._createItem(params);
      this.get(itemsPath).insertAt(index, item);
      return item;
    },

    // returns item at index, or if none, creates new item at index and returns it
    getOrCreateItemAt: function(index) {
      return this.get(itemsPath).objectAt(index) || this.createItemAt(index);
    },

    // creates and returns a new item, does NOT insert into list
    _createItem: function(params = {}) {
      return this.get('store').createRecord(itemModelName, params);
    }
  };

  // implement readiness mixin
  let readinessKey = `${itemsPath}_isReady`;
  mixinParams[readinessKey] = Ember.computed(`${itemsPath}.@each.isReady`, function() {
    return this.get(itemsPath).isEvery('isReady', true);
  });

  return Ember.Mixin.create(DependentRelationshipMixin(itemsPath), ReadinessMixin(readinessKey), mixinParams);
  // return Ember.Mixin.create(DependentRelationshipMixin(itemsPath), mixinParams);
}
