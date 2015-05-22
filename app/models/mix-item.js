import Ember from 'ember';
import DS from 'ember-data';
import AbstractListItemMixin from 'linx/lib/models/abstract-list-item';

export default DS.Model.extend(
  AbstractListItemMixin('mix'), {

  track: DS.belongsTo('track'),
  transition: DS.belongsTo('transition'),
});
