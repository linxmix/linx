import Ember from 'ember';

import Clip from './clip';
import ArrangementVisualTrackClipMixin from 'linx/mixins/components/arrangement-visual/track-clip';

export default Clip.extend(
  ArrangementVisualTrackClipMixin, {

  call(selection) {
    this._super.apply(this, arguments);
    selection.classed('ArrangementVisualTrackClip', true);
  },
});
