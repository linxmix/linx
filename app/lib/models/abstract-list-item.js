import Ember from 'ember';
import DS from 'ember-data';

export default function(listType) {
  var mixinParams = {
    index: DS.attr('number'),
  };

  mixinParams[listType] = DS.belongsTo(listType, { async: true });

  return Ember.Mixin.create(mixinParams)
};
