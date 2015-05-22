import Ember from 'ember';
import DS from 'ember-data';

export default function(itemType) {
  var mixinParams = {
    content: DS.hasMany(itemType),

    sortAscending: true,
    sortProperties: ['index'],  
    length: Ember.computed.alias('content.length'),

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
  };

  return Ember.Mixin.create(Ember.SortableMixin, mixinParams);
};
