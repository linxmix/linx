import Ember from 'ember';

import ArrangementVisualClip from '../arrangement-visual/clip';

import equalProps from 'linx/lib/computed/equal-props';
import { variableTernary } from 'linx/lib/computed/ternary';

export default ArrangementVisualClip.extend({
  layoutName: 'components/arrangement-visual/clip',

  // required params
  clip: null,
  selectedClip: null,
  fullHeight: null,
  rowHeight: null,

  height: variableTernary('isSelected', 'rowHeight', 'fullHeight'),

  call(selection) {
    this._super.apply(this, arguments);
    selection.classed('MixVisualClip', true);
  },

  selectedFromTrackClip: Ember.computed.reads('selectedClip.fromTrackClip'),
  selectedToTrackClip: Ember.computed.reads('selectedClip.toTrackClip'),

  isSelectedFromTrackClip: equalProps('selectedFromTrackClip', 'clip'),
  isSelectedToTrackClip: equalProps('selectedToTrackClip', 'clip'),

  isSelectedClip: equalProps('selectedClip.id', 'clip.id'),
  isSelected: Ember.computed.or('isSelectedClip', 'isSelectedFromTrackClip', 'isSelectedToTrackClip'),
});
