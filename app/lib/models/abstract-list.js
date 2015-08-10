import Ember from 'ember';
import DS from 'ember-data';
import withDefault from 'linx/lib/computed/with-default';

export default function(itemModelName) {
  var mixinParams = {
    _items: DS.hasMany(itemModelName, { async: true }),
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

    insertItemAt: function(index, item) {
      return this.get('items').insertAt(index, item);
    },

    // swaps position of items at two given indices
    swapItems: function(indexA, indexB) {
      // TODO
    },

    // creates a new item and inserts it at given index
    createItemAt: function(index, params) {
      var item = this._createItem(params);
      this.get('items').insertAt(index, item);
      return item;
    },

    // returns item at index, or if none, creates new item at index and returns it
    getOrCreateItemAt: function(index) {
      return this.get('items').objectAt(index) || this.createItemAt(index);
    },

    // creates and returns a new item, does NOT insert into list
    _createItem: function(params) {
      return this.get('store').createRecord(itemModelName, params);
    },

    objectAt: function(index) {
      var items = this.get('items');
      return items.objectAt.apply(items, arguments);
    },

    // augment destroyRecord to also destroy items
    destroyRecord: function() {
      var promises = this.get('items').map((item) => {
        return item && item.destroyRecord();
      });

      promises.push(this._super.apply(this, arguments));
      return Ember.RSVP.all(promises);
    },

    // augment save to also save new items
    save: function() {
      var promises = this.get('items').filterBy('isNew').map((item) => {
        return item && item.save();
      });

      promises.push(this._super.apply(this, arguments));
      return Ember.RSVP.all(promises);
    },

  };

  return Ember.Mixin.create(mixinParams);
};
