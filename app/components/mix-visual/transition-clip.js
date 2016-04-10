import Ember from 'ember';

import MixVisualClipMixin from 'linx/mixins/components/mix-visual/clip';
import ArrangementVisualClip from 'linx/components/arrangement-visual/clip';

import { constantTernary } from 'linx/lib/computed/ternary';

export default ArrangementVisualClip.extend(
  MixVisualClipMixin, {

  // overrides
  layoutName: 'components/arrangement-visual/clip',

  row: constantTernary('isSelectedClip', 1, 0),
  isDraggable: Ember.computed.reads('isSelectedClip'),
  isResizable: Ember.computed.reads('isSelectedClip'),

  transition: Ember.computed.reads('clip.transition'),
  fromTrackClip: Ember.computed.reads('clip.fromTrackClip'),
  toTrackClip: Ember.computed.reads('clip.toTrackClip'),

  // used to keep track of where things were when drag started
  _dragStartValue: 0,

  actions: {
    onDrag(d3Context, clip, dBeats) {
      const newBeat = this.attrs.quantizeBeat(this.get('_dragStartValue') + dBeats);
      const fromTrackClip = this.get('fromTrackClip');

      Ember.run.throttle(fromTrackClip, fromTrackClip.set, 'audioEndBeat', newBeat, 10, true);
    },

    onDragStart(d3Context, clip) {
      const fromTrackClip = this.get('fromTrackClip');
      this.set('_dragStartValue', fromTrackClip.get('audioEndBeat'));
    },

    // TODO(TECHDEBT): resize isnt implemented well
    onResizeRight(d3Context, d, dBeats) {
      Ember.Logger.log('onResizeRight', onResizeRight, dBeats);
      this.get('transition').then((transition) => {
        transition.set('beatCount', Math.max(this.get('_dragStartValue') + dBeats, 0));
      });
    },

    onResizeLeft(d3Context, d, dBeats) {
      this.get('transition').then((transition) => {
        transition.set('beatCount', Math.max(this.get('_dragStartValue') - dBeats, 0));
      });
    },

    onResizeStart(d3Context, d) {
      this.set('_dragStartValue', this.get('beatCount'));
    },
  },


  call(selection) {
    this._super.apply(this, arguments);
    selection.classed('MixVisualTransitionClip', true);
  },
});
