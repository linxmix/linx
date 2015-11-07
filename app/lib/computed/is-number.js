import Ember from 'ember';

import { isNumber } from 'linx/lib/utils';

export default function(propertyPath) {
  return Ember.computed(propertyPath, function() {
    return isNumber(this.get(propertyPath));
  });
}
