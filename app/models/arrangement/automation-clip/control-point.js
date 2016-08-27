import Ember from 'ember';
import DS from 'ember-data';

import OrderedHasManyItemMixin from 'linx/mixins/models/ordered-has-many/item';

const { computed } = Ember;

export default DS.Model.extend(
  OrderedHasManyItemMixin('automationClip'), {

  beat: DS.attr('number'),
  value: DS.attr('number'),
  automationClip: DS.belongsTo('arrangement/automation-clip'),

  scaledValue: computed('value', 'automationClip.valueRange', {
    get() {
      const [minValue, maxValue] = this.get('automationClip.valueRange') || [0, 1];

      const value = this.get('value');
      const scaledValue = value / (maxValue - minValue);
      return scaledValue;
    },

    set(key, scaledValue) {
      const [minValue, maxValue] = this.get('automationClip.valueRange');

      const newValue = scaledValue * (maxValue - minValue);
      this.set('value', newValue);
      return scaledValue;
    }
  }),
});
