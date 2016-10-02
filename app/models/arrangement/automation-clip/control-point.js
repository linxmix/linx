import Ember from 'ember';
import DS from 'ember-data';

import d3 from 'd3';

import OrderedHasManyItemMixin from 'linx/mixins/models/ordered-has-many/item';
import withDefault from 'linx/lib/computed/with-default';
import { isValidNumber } from 'linx/lib/utils';

const { computed } = Ember;

export default DS.Model.extend(
  OrderedHasManyItemMixin('automationClip'), {

  beat: DS.attr('number'),
  value: DS.attr('number'),
  automationClip: DS.belongsTo('arrangement/automation-clip'),

  valueScale: withDefault('automationClip.valueScale', d3.scale.identity()),

  scaledValue: computed('value', 'automationClip.valueScale', {
    get() {
      const scale = this.get('valueScale');
      const value = scale(this.get('value'));
      return isValidNumber(value) ? value : 0;
    },

    set(key, scaledValue) {
      const scale = this.get('valueScale');
      const newValue = scale.invert(scaledValue);

      this.set('value', newValue);
      return scaledValue;
    }
  }),
});
