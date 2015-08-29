import DS from 'ember-data';
import OrderedHasManyMixin from 'linx/mixins/models/ordered-has-many';

// Model exists solely for testing
export default DS.Model.extend(OrderedHasManyMixin('ordered-has-many-item'));
