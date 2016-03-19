import Ember from 'ember';

import ArrangementVisualAutomationClip from 'linx/components/arrangement-visual/automation-clip';
import MixVisualClipMixin from 'linx/mixins/components/mix-visual/clip';

import add from 'linx/lib/computed/add';

export default ArrangementVisualAutomationClip.extend(
  MixVisualClipMixin, {

  // overrides
  layoutName: 'components/arrangement-visual/automation-clip',
  isDraggable: false,

  selectedControlPointIsEdge: Ember.computed.or('selectedControlPoint.isFirstItem', 'selectedControlPoint.isLastItem'),
  canMoveControlPoint: Ember.computed.not('selectedControlPointIsEdge'),

  // mix-visual automation clip overlaps with associated transitionClip
  startBeat: add('clip.startBeat', 'clip.transition.transitionClip.startBeat'),

  call(selection) {
    this._super.apply(this, arguments);
    selection.classed('MixVisualAutomationClip', true);
  },
});
