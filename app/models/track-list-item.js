import Ember from 'ember';
import DS from 'ember-data';
import OrderedHasManyItemMixin from 'linx/mixins/models/ordered-has-many-item';

export default DS.Model.extend(
  OrderedHasManyItemMixin('track-list'), {

  track: DS.belongsTo('track', { async: true }),
});
