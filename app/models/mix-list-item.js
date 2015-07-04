import Ember from 'ember';
import DS from 'ember-data';
import AbstractListItemMixin from 'linx/lib/models/abstract-list-item';

export default DS.Model.extend(
  AbstractListItemMixin('mix'), {

  track: DS.belongsTo('track', { async: true }),
  transition: DS.belongsTo('transition', { async: true }),

  mix: Ember.computed.alias('list'),
});
