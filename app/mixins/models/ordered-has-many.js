import Ember from 'ember';
import DS from 'ember-data';

import _ from 'npm:underscore';

import DependentRelationshipMixin from './dependent-relationship';
import ReadinessMixin from '../readiness';
import AliasObjectMethodsMixin from '../alias-object-methods';
import AliasObjectPropertiesMixin from '../alias-object-properties';
import RequireAttributes from 'linx/lib/require-attributes';

import withDefault from 'linx/lib/computed/with-default';
import { isNumber } from 'linx/lib/utils';

const OUT_OF_RANGE_EXCEPTION = 'Index out of range';

// implements Ember.MutableArray, mutating underlying hasMany array
export const OrderedHasManyProxy = Ember.ArrayProxy.extend(
  RequireAttributes('hasMany'), {

  // replace underlying hasMany,
  // updating item orders appropriately
  replaceContent(index, amount, objectsToAdd) {
    if (index > Ember.get(this, 'content.length')) {
      throw new EmberError(OUT_OF_RANGE_EXCEPTION);
    }

    let hasManyContent = this.get('hasMany.content');

    // first remove objects based on sortedContent
    let sortedContent = this.get('content');
    let objectsToRemove = sortedContent.slice(index, amount);
    hasManyContent.removeObjects(objectsToRemove);

    // then update object orders
    let prevOrder = this._getIndexOrder(index - 1);
    let nextOrder = this._getIndexOrder(index);

    for (let i = 0; i < objectsToAdd.get('length'); i++) {
      let object = objectsToAdd.objectAt(i);
      let objectOrder = this._getOrder(prevOrder, nextOrder);

      object.set('order', objectOrder);
      prevOrder = objectOrder;
    }

    // then add objects
    hasManyContent.addObjects(objectsToAdd);
  },

  // augments insertAt to support multiple objects
  _insertAt: function(index, objects) {
    if (Ember.isArray(objects)) {
      this.replace(index, 0, objects);
      return this;
    } else {
      return this._super.apply(this, arguments);
    }
  },

  // gets order of given index
  _getIndexOrder(index) {
    let item = this.objectAt(index);

    return item && item.get('order');
  },

  // gets order given optional prevOrder and nextOrder
  _getOrder(prevOrder, nextOrder) {
    let order;

    if (isNumber(prevOrder) && isNumber(nextOrder)) {
      order = prevOrder + ((nextOrder - prevOrder) / 2.0);
    } else if (isNumber(prevOrder)) {
      order = prevOrder * 2.0;
    } else if (isNumber(nextOrder)) {
      order = nextOrder / 2.0;
    } else {
      order = 1.000;
    }

    return order;
  },

  // TODO: this will create new array... somehow maintain old?
  content: Ember.computed.sort('hasMany.content', 'hasManySort'),
  hasManySort: ['order:asc'],
});

// exposes sorted items
export default function(hasManyPath, itemModelName) {
  Ember.assert('Need hasManyPath for OrderedHasManyMixin', hasManyPath);
  Ember.assert('Need itemModelName for OrderedHasManyMixin', itemModelName);

  let mixinParams = {
    items: Ember.computed(hasManyPath, function() {
      console.log("recompute orderedItems", this.constructor.modelName);
      return OrderedHasManyProxy.create({ hasMany: this.get(hasManyPath) });
    }),

    // creates a new item and appends it to end of list
    createAndAppend: function(params) {
      return this.createAt(this.get('length'), params);
    },

    // creates a new item and inserts it at given index
    createAt: function(index, params) {
      let item = this._createItem(params);
      this.insertAt(index, item);
      return item;
    },

    // returns item at index, or if none, creates new item at index and returns it
    getOrCreateAt: function(index) {
      return this.objectAt(index) || this.createAt(index);
    },

    // creates and returns a new item, does NOT insert into list
    _createItem: function(params = {}) {
      return this.get('store').createRecord(itemModelName, params);
    },

    // swaps position of items
    swap: function(itemA, itemB) {
      this.swapIndices(this.indexOf(itemA), this.indexOf(itemB));
    },

    // swaps position of items at two given indices
    swapIndices: function(indexA, indexB) {
      let itemA = this.objectAt(indexA);
      let itemB = this.objectAt(indexB);

      Ember.assert('Items must be present to swap.', Ember.isPresent(itemA) && Ember.isPresent(itemB));
      Ember.assert('Must provide different indices to swap.', indexA !== indexB);

      this.removeObjects([itemA, itemB]);

      // this.replace(indexA, 1, [itemB]);
      // this.replace(indexB, 1, [itemA]);

      if (indexA < indexB) {
        this.insertAt(indexA, itemB);
        this.insertAt(indexB, itemA);
      } else {
        this.insertAt(indexB, itemA);
        this.insertAt(indexA, itemB);
      }
    },
  };

  // implement readiness mixin
  let readinessKey = `${hasManyPath}_isReady`;
  mixinParams[readinessKey] = Ember.computed(`${hasManyPath}.@each.isReady`, function() {
    return this.get(hasManyPath).isEvery('isReady', true);
  });

  // this is how ordered-has-many implements Ember.MutableArray
  // note we cannot extend Ember.MutableArray explicitly for a model
  let itemsMethodAliases = ['addArrayObserver', 'addObject', 'addObjects', 'arrayContentDidChange', 'arrayContentWillChange', 'clear', 'compact', 'contains', 'every', 'filter', 'filterBy', 'find', 'findBy', 'forEach', 'getEach', 'indexOf', 'insertAt', 'isEvery', 'lastIndexOf', 'map', 'mapBy', 'objectAt', 'objectsAt', 'popObject', 'pushObject', 'pushObjects', 'reject', 'rejectBy', 'removeArrayObserver', 'removeAt', 'removeObject', 'removeObjects', 'replace', 'reverseObjects', 'setEach', 'setObjects', 'shiftObject', 'slice', 'sortBy', 'unshiftObject', 'unshiftObjects', 'without'];

  let itemsPropertyAliases = ['@each', '[]', 'firstObject', 'hasArrayObservers', 'lastObject', 'length'];

  return Ember.Mixin.create(
    AliasObjectMethodsMixin('items', itemsMethodAliases),
    AliasObjectPropertiesMixin('items', itemsPropertyAliases),
    DependentRelationshipMixin(hasManyPath),
    ReadinessMixin(readinessKey),
    mixinParams
  );
}
