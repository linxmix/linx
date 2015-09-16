import DS from 'ember-data';
import OrderedHasManyMixin from 'linx/mixins/models/ordered-has-many';

// Model exists solely for testing
export default DS.Model.extend(
  OrderedHasManyMixin('orderedHasManyItems', 'ordered-has-many-item'), {

  title: DS.attr('string'),
  orderedHasManyItems: DS.hasMany('ordered-has-many-item', { async: true }),
});
