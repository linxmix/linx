import Ember from 'ember';
import DS from 'ember-data';
import _ from 'npm:underscore';

import DependentRelationshipMixin from 'linx/mixins/models/dependent-relationship';

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

      items.replace(indexA, 1, [itemB]);
      items.replace(indexB, 1, [itemA]);

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
    },

    // augment destroyRecord to also destroy items
    destroyRecord: function() {
      let promises = this.get(itemsPath).map((item) => {
        return item && item.destroyRecord();
      });

      promises.push(this._super.apply(this, arguments));
      return Ember.RSVP.all(promises);
    },

    save: function() {
      console.log("ordered-has-many save")
      return this._super.apply(this, arguments);
    },

  };

  return Ember.Mixin.create(DependentRelationshipMixin(itemsPath), mixinParams);
}
