import Ember from 'ember';

import { beatToTime as beatToTimeUtil } from 'linx/lib/utils';

export function beatToTime([beat, time]) {
  return beatToTimeUtil(beat, time);
}

export default Ember.Helper.helper(beatToTime);
