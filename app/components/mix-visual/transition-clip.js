import Ember from 'ember';

import MixVisualClipMixin from 'linx/mixins/components/mix-visual/clip';
import ArrangementVisualClip from 'linx/components/arrangement-visual/clip';

import { constantTernary } from 'linx/lib/computed/ternary';

export default ArrangementVisualClip.extend(
  MixVisualClipMixin, {

  layoutName: 'components/arrangement-visual/clip',

  row: constantTernary('isSelectedClip', 1, 0),

  call(selection) {
    this._super.apply(this, arguments);
    selection.classed('MixVisualTransitionClip', true);
  },
});
