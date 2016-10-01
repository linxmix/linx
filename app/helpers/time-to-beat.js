import Ember from 'ember';

import { timeToBeat as timeToBeatUtil } from 'linx/lib/utils';

export function timeToBeat([beat, time]) {
  return timeToBeatUtil(beat, time);
}

export default Ember.Helper.helper(timeToBeat);
