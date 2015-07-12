import Ember from 'ember';
import DS from 'ember-data';
import AbstractListItemMixin from 'linx/lib/models/abstract-list-item';

export default DS.Model.extend(
  AbstractListItemMixin('track-list'), {

  track: DS.belongsTo('track', { async: true }),
});
