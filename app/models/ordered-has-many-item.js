import DS from 'ember-data';
import OrderedHasManyItemMixin from 'linx/mixins/models/ordered-has-many-item';

// Model exists solely for testing
export default DS.Model.extend(
  OrderedHasManyItemMixin('list'), {

  list: DS.belongsTo('ordered-has-many', { async: true }),
});
