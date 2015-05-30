import Ember from 'ember';
import DS from 'ember-data';

export default function(itemType) {
  var mixinParams = {
    content: DS.hasMany(itemType, { async: true }),

    sortAscending: true,
    sortProperties: ['index'],  
    length: Ember.computed.alias('content.length'),
    dirtyContent: Ember.computed.filterBy('content.isDirty'),

    isDirty: function() {
      var modelIsDirty = this._super.apply(this, arguments);
      var itemIsDirty = this.get('dirtyContent.length') > 0;

      return modelIsDirty || itemIsDirty;
    }.property('isDirty', 'dirtyContent.length'),

    pushObject: function(item) {
      this.pushObjects([item]);
    },

    pushObjects: function(items) {
      var index = this.get('content.length');

      items.forEach(function(item) {
        item.set('index', index++);
      });

      this.get('content').pushObjects(items);
    },

    save: function() {
      this.get('dirtyContent').forEach(function(item) {
        item.save();
      });

      return this._super.apply(this, arguments);
    },
  };

  return Ember.Mixin.create(Ember.SortableMixin, mixinParams);
};
