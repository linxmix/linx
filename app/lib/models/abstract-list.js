import Ember from 'ember';
import DS from 'ember-data';

export default function(itemType) {
  var mixinParams = {
    content: DS.hasMany(itemType, { async: true }),

    dirtyContent: Ember.computed.filterBy('content', 'isDirty'),
    contentIsDirty: Ember.computed.gt('dirtyContent.length', 0),

    saveContent: function() {
      this.get('dirtyContent').forEach(function(item) {
        item.save();
      });
    },

    createItem: function(params) {
      return this.get('store').createRecord(itemType, params);
    },

    createItemAt: function(index, params) {
      var item = this.createItem(params);
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

      // once saves and removes are done, save list
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
