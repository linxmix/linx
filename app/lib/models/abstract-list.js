import Ember from 'ember';
import DS from 'ember-data';

export default function(itemType) {
  var mixinParams = {
    items: DS.hasMany(itemType, { async: true }),

    dirtyItems: Ember.computed.filterBy('items', 'isDirty'),
    itemsAreDirty: Ember.computed.gt('dirtyItems.length', 0),
    anyDirty: Ember.computed.any('isDirty', 'itemsAreDirty'),

    // creates a new item and appends it to end of list
    createItem: function(params) {
      return this.createItemAt(this.get('length'), params);
    },

    // creates a new item and inserts it at given index
    createItemAt: function(index, params) {
      var item = this._createItem(params);
      this.insertAt(index, item);
      return item;
    },

    // returns item at index, or if none, creates new item at index and returns it
    assertItemAt: function(index) {
      return this.objectAt(index) || this.createItemAt(index);
    },

    // creates and returns a new item, does NOT insert into list
    _createItem: function(params) {
      return this.get('store').createRecord(itemType, params);
    },

    //
    // Necessary functions to be Ember.MutableArray
    //
    length: Ember.computed.alias('items.length'),

    nextObject: function(index, previousObject, context) {
      var items = this.get('items');
      return items.nextObject.apply(items, arguments);
    },

    objectAt: function(index) {
      var items = this.get('items');
      return items.objectAt.apply(items, arguments);
    },

    replace: function(index, amount, objects) {
      var items = this.get('items');

      var itemsToRemove = items.slice(index, index + amount);
      var itemsToSave = objects;

      // replace local items immediately
      items.replace.apply(items, arguments);

      // destroy items that are removed,
      var removePromises = itemsToRemove.map((item) => {
        return item.destroyRecord();
      });

      // save items that are added,
      var savePromises = itemsToSave.map((item) => {
        return item.save();
      });

      // then once saves and removes are done, save list
      return Ember.RSVP.all(removePromises.concat(savePromises)).then((results) => {
        // console.log("list save from replace", this.get('constructor') + '');
        // console.log("itemsToRemove", itemsToRemove.get('length'));
        // console.log("itemsToSave", itemsToSave.get('length'));
        return this.save();
      });
    },

    // augment destroyRecord to also destroy items
    destroyRecord: function() {
      var promises = this.get('items').map((item) => {
        return item && item.destroyRecord();
      });

      promises.push(this._super.apply(this, arguments));
      return Ember.RSVP.all(promises);
    },

  };

  return Ember.Mixin.create(Ember.MutableArray, mixinParams);
};
