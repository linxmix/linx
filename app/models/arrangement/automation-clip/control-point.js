import Ember from 'ember';
import DS from 'ember-data';

import d3 from 'd3';

import OrderedHasManyItemMixin from 'linx/mixins/models/ordered-has-many/item';

const { computed } = Ember;

export default DS.Model.extend(
  OrderedHasManyItemMixin('automationClip'), {

  beat: DS.attr('number'),
  value: DS.attr('number'),
  automationClip: DS.belongsTo('arrangement/automation-clip'),

  scaledValue: computed('value', 'automationClip.valueScale', {
    get() {
      const scale = this.get('automationClip.valueScale');
      return scale(this.get('value'));
    },

    set(key, scaledValue) {
      const scale = this.get('automationClip.valueScale');
      const newValue = scale.invert(scaledValue);

      this.set('value', newValue);
      return scaledValue;
    }
  }),
});
