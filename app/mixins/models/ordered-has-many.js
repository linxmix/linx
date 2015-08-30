import Ember from 'ember';
import DS from 'ember-data';
import withDefault from 'linx/lib/computed/with-default';
import _ from 'npm:underscore';

export default function(itemModelName, relOptions = {}) {
  let mixinParams = {

    // config
    saveItems: false,

    _items: DS.hasMany(itemModelName, _.defaults(relOptions, { async: true })),
    items: withDefault('_items.content', []),

    dirtyItems: Ember.computed.filterBy('items', 'isDirty'),
    itemsAreDirty: Ember.computed.gt('dirtyItems.length', 0),
    anyDirty: Ember.computed.or('isDirty', 'itemsAreDirty'),
    length: Ember.computed.alias('items.length'),

    // creates a new item and appends it to end of list
    appendItem: function(params) {
      return this.createItemAt(this.get('length'), params);
    },

    removeItem: function(item) {
      return this.get('items').removeObject(item);
    },

    removeAt: function(index) {
      return this.get('items').removeAt(index);
    },

    insertItemAt: function(index, item) {
      return this.get('items').insertAt(index, item);
    },

    indexOf: function(item) {
      return this.get('items').indexOf(item);
    },

    objectAt: function(index) {
      return this.get('items').objectAt(index);
    },

    // swaps position of items
    swapItems: function(itemA, itemB) {
      return this.swap(this.indexOf(itemA), this.indexOf(itemB));
    },

    // swaps position of items at two given indices
    swap: function(indexA, indexB) {
      let items = this.get('items');
      let itemA = this.objectAt(indexA);
      let itemB = this.objectAt(indexB);

      items.replace(indexA, 1, [itemB]);
      items.replace(indexB, 1, [itemA]);

      return items;
    },

    // creates a new item and inserts it at given index
    createItemAt: function(index, params) {
      let item = this._createItem(params);
      this.get('items').insertAt(index, item);
      return item;
    },

    // returns item at index, or if none, creates new item at index and returns it
    getOrCreateItemAt: function(index) {
      return this.get('items').objectAt(index) || this.createItemAt(index);
    },

    // creates and returns a new item, does NOT insert into list
    _createItem: function(params = {}) {
      return this.get('store').createRecord(params.modelName || itemModelName, params);
    },

    // augment destroyRecord to also destroy items
    destroyRecord: function() {
      let promises = this.get('items').map((item) => {
        return item && item.destroyRecord();
      });

      promises.push(this._super.apply(this, arguments));
      return Ember.RSVP.all(promises);
    },

    // augment save to optionally also save new items
    save: function() {
      if (!this.get('saveItems')) {
        return this._super.apply(this, arguments);
      }

      let promises = this.get('items').filterBy('isNew').map((item) => {
        return item && item.save();
      });

      promises.push(this._super.apply(this, arguments));
      return Ember.RSVP.all(promises);
    },

  };

  return Ember.Mixin.create(mixinParams);
}
