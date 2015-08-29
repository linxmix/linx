import DS from 'ember-data';
import AbstractListItemMixin from 'linx/mixins/models/abstract-list-item';

// Model exists solely for testing
export default DS.Model.extend(
  AbstractListItemMixin('list'), {

  list: DS.belongsTo('abstract-list', { async: true }),
});
