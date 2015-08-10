import DS from 'ember-data';
import AbstractListItemMixin from 'linx/lib/models/abstract-list-item';

// Model exists solely for testing
export default DS.Model.extend(
  AbstractListItemMixin('list'), {

  list: DS.belongsTo('abstract-list', { async: true }),
});
