import Ember from 'ember';

import ArrangementVisualTrackClip from 'linx/components/arrangement-visual/track-clip';
import MixVisualClipMixin from 'linx/mixins/components/mix-visual/clip';

import { constantTernary, propertyOrDefault } from 'linx/lib/computed/ternary';
import { FROM_TRACK_COLOR, TO_TRACK_COLOR } from 'linx/components/simple-mix';

export default ArrangementVisualTrackClip.extend(
  MixVisualClipMixin, {

  layoutName: 'components/arrangement-visual/track-clip',

  // only tracks in selected transition can be dragged
  isDraggable: Ember.computed.reads('isSelected'),

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
    selection.classed('MixVisualTrackClip', true);
  },
});
