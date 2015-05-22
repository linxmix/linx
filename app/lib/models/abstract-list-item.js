import Ember from 'ember';
import DS from 'ember-data';

export default function(listType) {
  var mixinParams = {
    index: DS.attr('number'),
    list: DS.belongsTo(listType),
  };

  return Ember.Mixin.create(mixinParams)
};
