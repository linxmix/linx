import Ember from 'ember';

import MixVisualClip from './clip';

import { constantTernary } from 'linx/lib/computed/ternary';

export default MixVisualClip.extend({

  row: constantTernary('isSelectedClip', 1, 0),

  call(selection) {
    this._super.apply(this, arguments);
    selection.classed('MixVisualTransitionClip', true);
  },
});
