import Ember from 'ember';
import DS from 'ember-data';

export default function(listType) {
  var mixinParams = {
    position: function() {
      return this.get('index') + 1;
    }.property('index')
  };

  mixinParams[listType] = DS.belongsTo(listType, { async: true });

  // add index as computedProperty
  mixinParams.index = Ember.computed(listType + '.content.[]', function() {
    // TODO: why is item.list !== list?
    var list = this.get(listType);
    return list.get('content').indexOf(this);
  });

  return Ember.Mixin.create(mixinParams)
};
