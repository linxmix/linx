import Ember from 'ember';

import { arraySum } from 'linx/lib/utils';

export function add(args) {
  return arraySum(args);
}

export default Ember.Helper.helper(add);
