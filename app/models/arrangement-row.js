import Ember from 'ember';
import DS from 'ember-data';

export default DS.Model.extend({
  index: DS.attr('number'),

  arrangement: DS.belongsTo('arrangement'),
  items: DS.hasMany('arrangement-item'),

  addItem: function(item) {
    return this.addItems([item]);
  },

  addItems: function(items) {
    this.get('items').pushObjects(items);
  },
});
