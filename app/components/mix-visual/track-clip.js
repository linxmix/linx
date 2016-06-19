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
    onClick() {
      // if (this.get('selectedTransition')) {
        this.sendAction('selectClip', this.get('clip'));
      // }
    },

    onDrag(d3Context, d, dBeats) {
      dBeats = this.attrs.quantizeBeat(dBeats);
      const newBeat = this.get('_dragStartBeat') - dBeats;
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

  // only to tracks in selected transition can be dragged (or first track)
  isDraggable: Ember.computed.or('isSelectedToTrackClip', 'clip.mixItem.isFirstItem'),

  // display waveform only if no clip is selected, or this clip is in the selection
  displayWaveform: propertyOrDefault('selectedTransition', 'isInSelectedTransition', true),
  row: constantTernary('isSelectedToTrackClip', 2, 0),

  waveColor: Ember.computed('isSelectedFromTrackClip', 'isSelectedToTrackClip', function() {
    if (this.get('isSelectedFromTrackClip')) return FROM_TRACK_COLOR;
    if (this.get('isSelectedToTrackClip')) return TO_TRACK_COLOR;
    return 'steelblue';
  }),

  call(selection) {
    this._super.apply(this, arguments);
    selection.classed('MixVisualTrackClip', true);
  },
});
