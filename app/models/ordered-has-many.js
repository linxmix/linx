import DS from 'ember-data';
import OrderedHasManyMixin from 'linx/mixins/models/ordered-has-many';

// Model exists solely for testing
export default DS.Model.extend(
  OrderedHasManyMixin({ itemModelName: 'ordered-has-many-item', itemsPath: 'items' }), {

  items: DS.hasMany('ordered-has-many-item', { async: true }),
});
