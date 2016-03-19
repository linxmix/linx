import DS from 'ember-data';

import OrderedHasManyItemMixin from 'linx/mixins/models/ordered-has-many/item';

export default DS.Model.extend(
  OrderedHasManyItemMixin('automationClip'), {

  beat: DS.attr('number'),
  value: DS.attr('number'),
  automationClip: DS.belongsTo('arrangement/automation-clip'),
});
