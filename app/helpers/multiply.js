import Ember from 'ember';

import { arrayProduct } from 'linx/lib/utils';

export function multiply(args) {
  return arrayProduct(args);
}

export default Ember.Helper.helper(multiply);
