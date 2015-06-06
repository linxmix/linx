import Ember from 'ember';
import DS from 'ember-data';

export default function(itemType) {
  var mixinParams = {
    content: DS.hasMany(itemType, { async: true }),
    items: Ember.computed.alias('content'),

    dirtyContent: Ember.computed.filterBy('content', 'isDirty'),
    contentIsDirty: Ember.computed.gt('dirtyContent.length', 0),
    anyDirty: Ember.computed.any('isDirty', 'contentIsDirty'),

    saveContent: function() {
      this.get('dirtyContent').forEach(function(item) {
        item.save();
      });
    },

    // creates and returns a new item, does NOT insert into list
    _createItem: function(params) {
      return this.get('store').createRecord(itemType, params);
    },

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

    assertItemAt: function(index) {
      return this.objectAt(index) || this.createItemAt(index);
    },

    //
    // Necessary functions to be Ember.MutableArray
    //
    length: Ember.computed.alias('content.length'),

    nextObject: function(index, previousObject, context) {
      var content = this.get('content');
      return content.nextObject.apply(content, arguments);
    },

    replace: function(index, amount, objects) {
      var content = this.get('content');

      var itemsToRemove = content.slice(index, index + amount);
      var itemsToSave = objects;

      // replace local content immediately
      content.replace.apply(content, arguments);

      // destroy items that are removed,
      var removePromises = itemsToRemove.map((item) => {
        return item.destroyRecord();
      });

      // save items that are added,
      var savePromises = itemsToSave.map((item) => {
        return item.save();
      });

      // then once saves and removes are done, save list
      Ember.RSVP.all(removePromises.concat(savePromises)).then((results) => {
        this.save();
      });
    },

    objectAt: function(index) {
      var content = this.get('content');
      return content.objectAt.apply(content, arguments);
    },

  };

  return Ember.Mixin.create(Ember.MutableArray, mixinParams);
};
