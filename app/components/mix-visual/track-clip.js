import Ember from 'ember';

import MixVisualClip from './clip';
import ArrangementVisualTrackClipMixin from 'linx/mixins/components/arrangement-visual/track-clip';

import { constantTernary } from 'linx/lib/computed/ternary';

export default MixVisualClip.extend(
  ArrangementVisualTrackClipMixin, {

  layoutName: 'components/arrangement-visual/track-clip',

  row: constantTernary('isSelectedToTrackClip', 2, 0),

  call(selection) {
    this._super.apply(this, arguments);
    selection.classed('ArrangementVisualMixClip', true);
  },
});
