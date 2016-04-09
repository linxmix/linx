import Ember from 'ember';

import ArrangementVisualTrackClip from 'linx/components/arrangement-visual/track-clip';
import MixVisualClipMixin from 'linx/mixins/components/mix-visual/clip';

import { constantTernary, propertyOrDefault } from 'linx/lib/computed/ternary';
import { FROM_TRACK_COLOR, TO_TRACK_COLOR } from 'linx/components/mix-builder';

export default ArrangementVisualTrackClip.extend(
  MixVisualClipMixin, {

  // required params
  quantizeBeat: null,

  actions: {
    onDrag(d3Context, d, dBeats) {
      const newBeat = this.attrs.quantizeBeat(this.get('_dragStartBeat') - dBeats);
      const clip = this.get('clip');

      Ember.run.throttle(clip, clip.set, 'audioStartBeat', newBeat, 10, true);
    },

    onDragStart(d3Context, d) {
      this.set('_dragStartBeat', this.get('clip.audioStartBeat'));
    },
  },

  // used to keep track of where audio was when drag started
  _dragStartBeat: 0,

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
