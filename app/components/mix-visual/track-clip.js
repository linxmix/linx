import Ember from 'ember';

import MixVisualClip from './clip';
import ArrangementVisualTrackClipMixin from 'linx/mixins/components/arrangement-visual/track-clip';

import { constantTernary, propertyOrDefault } from 'linx/lib/computed/ternary';
import { FROM_TRACK_COLOR, TO_TRACK_COLOR } from 'linx/components/simple-mix';

export default MixVisualClip.extend(
  ArrangementVisualTrackClipMixin, {

  layoutName: 'components/arrangement-visual/track-clip',

  // display waveform only if no clip is selected, or this clip is in the selection
  displayWaveform: propertyOrDefault('selectedClip', 'isSelected', true),
  row: constantTernary('isSelectedToTrackClip', 2, 0),

  waveColor: Ember.computed('isSelectedFromTrackClip', 'isSelectedToTrackClip', function() {
    if (this.get('isSelectedFromTrackClip')) return FROM_TRACK_COLOR;
    if (this.get('isSelectedToTrackClip')) return TO_TRACK_COLOR;
    return 'green';
  }),

  call(selection) {
    this._super.apply(this, arguments);
    selection.classed('ArrangementVisualMixClip', true);
  },
});
