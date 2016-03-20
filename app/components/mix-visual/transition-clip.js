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

  _resizeBeatCount: 0,
  actions: {
    onResizeRight(d3Context, d, dBeats) {
      this.get('transition').then((transition) => {
        transition.set('beatCount', Math.max(this.get('_resizeBeatCount') + dBeats, 0));
      });
    },

    onResizeLeft(d3Context, d, dBeats) {
      this.get('transition').then((transition) => {
        transition.set('beatCount', Math.max(this.get('_resizeBeatCount') - dBeats, 0));
      });
    },

    onResizeStart(d3Context, d) {
      this.set('_resizeBeatCount', this.get('beatCount'));
    },
  },

  call(selection) {
    this._super.apply(this, arguments);
    selection.classed('MixVisualTransitionClip', true);
  },
});
