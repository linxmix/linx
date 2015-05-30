import Ember from 'ember';
import DS from 'ember-data';
import _ from 'npm:underscore';

export default function(itemType) {
  var mixinParams = {
    content: DS.hasMany(itemType, { async: true }),

    sortAscending: true,
    sortProperties: ['index'],  
    dirtyContent: Ember.computed.filterBy('content.isDirty'),

    isDirty: function() {
      var modelIsDirty = this._super.apply(this, arguments);
      var itemIsDirty = this.get('dirtyContent.length') > 0;

      return modelIsDirty || itemIsDirty;
    }.property('isDirty', 'dirtyContent.length'),

    save: function() {
      this.get('dirtyContent').forEach(function(item) {
        item.save();
      });

      return this._super.apply(this, arguments);
    },

    createItem: function(params) {
      return this.get('store').createRecord(itemType, params)
    },

    createItemAt: function(index, params) {
      var item = this.createItem(params);
      return this.insertAt(index, item);
    },

    //
    // Necessary functions to be a mutable, sortable, enumerable array
    //
    length: Ember.computed.alias('content.length'),

    nextObject: function(index, previousObject, context) {
      console.log("next object", arguments);
      return this.get('content').nextObject.apply(this, arguments);
    },

    replace: function(index, amount, objects) {
      console.log("replace", arguments);
      // TODO
    },

    objectAt: function(index) {
      console.log("objectAt", arguments);

      return this.get('content').objectAt(index);
    },
  };

  return Ember.Mixin.create(Ember.SortableMixin, Ember.MutableArray, mixinParams);
};
